import { useMemo, useState } from 'react';
import { ContactStage, type IContact } from '@agencyos/shared';
import { downloadCsv, toCsv } from '@/lib/csv';
import { useContacts, useDeleteContact, useMoveStage, useTenantUsers } from './hooks';
import { STAGE_LABELS } from './constant/contactOptions';

function isOverdue(iso: string | null): boolean {
  return Boolean(iso && new Date(iso).getTime() < Date.now());
}

/**
 * Shared state + handlers for the Contacts workspace (table page and board page).
 * Keeps filters, queries, dialog/drawer state, and actions in one place (DRY).
 */
export function useContactsWorkspace() {
  const [search, setSearch] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueOnly, setDueOnly] = useState(false);

  const contactsQuery = useContacts({
    search: search.trim() || undefined,
    assignedToId: assignee || undefined,
    followUpDue: dueOnly || undefined,
  });
  const usersQuery = useTenantUsers();
  const moveStage = useMoveStage();
  const deleteContact = useDeleteContact();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<IContact | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = contactsQuery.data ?? [];

  const dueCount = useMemo(
    () =>
      rows.filter(
        (c) =>
          isOverdue(c.nextFollowUpAt) &&
          c.stage !== ContactStage.WON &&
          c.stage !== ContactStage.LOST,
      ).length,
    [rows],
  );

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (contact: IContact) => {
    setEditing(contact);
    setDialogOpen(true);
  };
  const handleDelete = (contact: IContact) => {
    if (window.confirm(`Delete “${contact.name}”?`)) deleteContact.mutate(contact.id);
  };
  const move = (id: string, stage: ContactStage) => moveStage.mutate({ id, stage });

  const exportCsv = () => {
    const csv = toCsv(
      ['name', 'company', 'email', 'mobile', 'whatsapp', 'source', 'stage', 'tags', 'notes'],
      rows.map((c) => [
        c.name,
        c.company,
        c.email,
        c.mobile,
        c.whatsapp,
        c.source,
        STAGE_LABELS[c.stage],
        c.tags.join('; '),
        c.notes,
      ]),
    );
    downloadCsv('contacts.csv', csv);
  };

  return {
    // data
    rows,
    isLoading: contactsQuery.isLoading,
    users: usersQuery.data ?? [],
    dueCount,
    // filters
    search,
    setSearch,
    assignee,
    setAssignee,
    dueOnly,
    setDueOnly,
    // dialog/drawer state
    dialogOpen,
    setDialogOpen,
    editing,
    importOpen,
    setImportOpen,
    selectedId,
    setSelectedId,
    // actions
    openCreate,
    openEdit,
    handleDelete,
    move,
    exportCsv,
  };
}

export type ContactsWorkspace = ReturnType<typeof useContactsWorkspace>;
