import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { ContactStage } from '@agencyos/shared';
import type { IContact, IContactActivity } from '@agencyos/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateActivityDto } from './dto/create-activity.dto';

interface IListFilters {
  stage?: ContactStage;
  search?: string;
  assignedToId?: string;
  tag?: string;
  /** When true, only contacts with a follow-up due on/before now (and still open). */
  followUpDue?: boolean;
}

const LIST_INCLUDE = {
  assignedTo: { select: { name: true } },
  _count: { select: { activities: true } },
} satisfies Prisma.ContactInclude;

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateContactDto): Promise<IContact> {
    await this.assertAssignee(tenantId, dto.assignedToId);
    const contact = await this.prisma.contact.create({
      data: {
        tenantId,
        name: dto.name.trim(),
        company: dto.company?.trim() || null,
        email: dto.email?.toLowerCase().trim() || null,
        mobile: dto.mobile?.trim() || null,
        whatsapp: dto.whatsapp?.trim() || null,
        source: dto.source?.trim() || null,
        stage: dto.stage ?? ContactStage.NEW,
        tags: this.cleanTags(dto.tags),
        notes: dto.notes?.trim() || null,
        assignedToId: dto.assignedToId || null,
        nextFollowUpAt: dto.nextFollowUpAt ? new Date(dto.nextFollowUpAt) : null,
      },
      include: LIST_INCLUDE,
    });
    return this.toDto(contact);
  }

  async findAll(tenantId: string, filters: IListFilters = {}): Promise<IContact[]> {
    const contacts = await this.prisma.contact.findMany({
      where: {
        tenantId,
        ...(filters.stage ? { stage: filters.stage } : {}),
        ...(filters.assignedToId ? { assignedToId: filters.assignedToId } : {}),
        ...(filters.tag ? { tags: { has: filters.tag } } : {}),
        ...(filters.followUpDue
          ? {
              nextFollowUpAt: { lte: new Date() },
              stage: { notIn: [ContactStage.WON, ContactStage.LOST] },
            }
          : {}),
        ...(filters.search
          ? {
              OR: [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { company: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
                { mobile: { contains: filters.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: LIST_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return contacts.map((c) => this.toDto(c));
  }

  async findOne(tenantId: string, id: string): Promise<IContact> {
    await this.getOwned(tenantId, id);
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        ...LIST_INCLUDE,
        activities: {
          orderBy: { occurredAt: 'desc' },
          include: { createdBy: { select: { name: true } } },
        },
      },
    });
    return this.toDto(contact!, true);
  }

  async update(tenantId: string, id: string, dto: UpdateContactDto): Promise<IContact> {
    await this.getOwned(tenantId, id);
    if (dto.assignedToId) {
      await this.assertAssignee(tenantId, dto.assignedToId);
    }
    const data: Prisma.ContactUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.company !== undefined) data.company = dto.company.trim() || null;
    if (dto.email !== undefined) data.email = dto.email.toLowerCase().trim() || null;
    if (dto.mobile !== undefined) data.mobile = dto.mobile.trim() || null;
    if (dto.whatsapp !== undefined) data.whatsapp = dto.whatsapp.trim() || null;
    if (dto.source !== undefined) data.source = dto.source.trim() || null;
    if (dto.stage !== undefined) data.stage = dto.stage;
    if (dto.tags !== undefined) data.tags = this.cleanTags(dto.tags);
    if (dto.notes !== undefined) data.notes = dto.notes.trim() || null;
    if (dto.assignedToId !== undefined) {
      data.assignedTo = dto.assignedToId
        ? { connect: { id: dto.assignedToId } }
        : { disconnect: true };
    }
    if (dto.nextFollowUpAt !== undefined) {
      data.nextFollowUpAt = dto.nextFollowUpAt ? new Date(dto.nextFollowUpAt) : null;
    }
    const contact = await this.prisma.contact.update({
      where: { id },
      data,
      include: LIST_INCLUDE,
    });
    return this.toDto(contact);
  }

  async moveStage(tenantId: string, id: string, stage: ContactStage): Promise<IContact> {
    await this.getOwned(tenantId, id);
    const contact = await this.prisma.contact.update({
      where: { id },
      data: { stage },
      include: LIST_INCLUDE,
    });
    return this.toDto(contact);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.getOwned(tenantId, id);
    await this.prisma.contact.delete({ where: { id } });
  }

  /** Logs an outreach touch and advances the contact's last-contacted / follow-up dates atomically. */
  async logActivity(
    tenantId: string,
    userId: string,
    contactId: string,
    dto: CreateActivityDto,
  ): Promise<IContact> {
    await this.getOwned(tenantId, contactId);
    const occurredAt = dto.occurredAt ? new Date(dto.occurredAt) : new Date();
    await this.prisma.$transaction([
      this.prisma.contactActivity.create({
        data: {
          tenantId,
          contactId,
          type: dto.type,
          outcome: dto.outcome ?? null,
          note: dto.note?.trim() || null,
          occurredAt,
          nextFollowUpAt: dto.nextFollowUpAt ? new Date(dto.nextFollowUpAt) : null,
          createdById: userId,
        },
      }),
      this.prisma.contact.update({
        where: { id: contactId },
        data: {
          lastContactedAt: occurredAt,
          ...(dto.nextFollowUpAt !== undefined
            ? { nextFollowUpAt: dto.nextFollowUpAt ? new Date(dto.nextFollowUpAt) : null }
            : {}),
        },
      }),
    ]);
    return this.findOne(tenantId, contactId);
  }

  /** Promotes a prospect into a Client and links the two records (single transaction). */
  async convert(tenantId: string, id: string): Promise<IContact> {
    const contact = await this.getOwned(tenantId, id);
    if (contact.convertedClientId) {
      throw new BadRequestException({
        message: 'This contact has already been converted',
        error: 'CONTACT_ALREADY_CONVERTED',
      });
    }
    await this.prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          tenantId,
          name: contact.company?.trim() || contact.name,
          contactName: contact.company ? contact.name : null,
          email: contact.email,
          phone: contact.mobile,
          notes: contact.notes,
          status: 'ACTIVE',
        },
      });
      await tx.contact.update({
        where: { id },
        data: { convertedClientId: client.id, stage: ContactStage.WON },
      });
    });
    return this.findOne(tenantId, id);
  }

  /** Bulk-creates contacts (CSV import). Skips per-row assignee to keep the import simple. */
  async importMany(tenantId: string, rows: CreateContactDto[]): Promise<{ created: number }> {
    const data = rows
      .filter((r) => r.name?.trim())
      .map((r) => ({
        tenantId,
        name: r.name.trim(),
        company: r.company?.trim() || null,
        email: r.email?.toLowerCase().trim() || null,
        mobile: r.mobile?.trim() || null,
        whatsapp: r.whatsapp?.trim() || null,
        source: r.source?.trim() || 'Import',
        stage: r.stage ?? ContactStage.NEW,
        tags: this.cleanTags(r.tags),
        notes: r.notes?.trim() || null,
      }));
    if (data.length === 0) {
      throw new BadRequestException({
        message: 'No valid rows to import',
        error: 'NO_IMPORT_ROWS',
      });
    }
    const result = await this.prisma.contact.createMany({ data });
    return { created: result.count };
  }

  // ---- helpers ----

  private cleanTags(tags?: string[]): string[] {
    if (!tags) return [];
    const cleaned = tags.map((t) => t.trim()).filter(Boolean);
    return Array.from(new Set(cleaned));
  }

  private async assertAssignee(tenantId: string, userId?: string): Promise<void> {
    if (!userId) return;
    const user = await this.prisma.user.findFirst({ where: { id: userId, tenantId } });
    if (!user) {
      throw new BadRequestException({
        message: 'Assigned user not found in this workspace',
        error: 'INVALID_ASSIGNEE',
      });
    }
  }

  private async getOwned(tenantId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({ where: { id, tenantId } });
    if (!contact) {
      throw new NotFoundException({ message: 'Contact not found', error: 'CONTACT_NOT_FOUND' });
    }
    return contact;
  }

  private toDto(
    contact: Prisma.ContactGetPayload<{ include: typeof LIST_INCLUDE }> & {
      activities?: Prisma.ContactActivityGetPayload<{
        include: { createdBy: { select: { name: true } } };
      }>[];
    },
    withActivities = false,
  ): IContact {
    return {
      id: contact.id,
      tenantId: contact.tenantId,
      name: contact.name,
      company: contact.company,
      email: contact.email,
      mobile: contact.mobile,
      whatsapp: contact.whatsapp,
      source: contact.source,
      stage: contact.stage as IContact['stage'],
      tags: contact.tags,
      notes: contact.notes,
      assignedToId: contact.assignedToId,
      assignedToName: contact.assignedTo?.name ?? null,
      convertedClientId: contact.convertedClientId,
      lastContactedAt: contact.lastContactedAt?.toISOString() ?? null,
      nextFollowUpAt: contact.nextFollowUpAt?.toISOString() ?? null,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
      activityCount: contact._count?.activities ?? 0,
      ...(withActivities
        ? { activities: (contact.activities ?? []).map((a) => this.activityDto(a)) }
        : {}),
    };
  }

  private activityDto(
    a: Prisma.ContactActivityGetPayload<{ include: { createdBy: { select: { name: true } } } }>,
  ): IContactActivity {
    return {
      id: a.id,
      contactId: a.contactId,
      type: a.type as IContactActivity['type'],
      outcome: (a.outcome as IContactActivity['outcome']) ?? null,
      note: a.note,
      occurredAt: a.occurredAt.toISOString(),
      nextFollowUpAt: a.nextFollowUpAt?.toISOString() ?? null,
      createdById: a.createdById,
      createdByName: a.createdBy?.name ?? null,
      createdAt: a.createdAt.toISOString(),
    };
  }
}
