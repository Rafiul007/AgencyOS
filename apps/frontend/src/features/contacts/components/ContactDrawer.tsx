import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import type { IContact } from '@agencyos/shared';
import { Icons } from '@/lib/iconHash';
import { brand } from '@/lib/theme';
import { useContact, useConvertContact, useDeleteContact } from '../hooks';
import { mailtoHref, telHref, whatsappHref } from '../actions';
import {
  ACTIVITY_TYPE_META,
  OUTCOME_LABELS,
  STAGE_COLORS,
  STAGE_LABELS,
} from '../constant/contactOptions';
import { LogActivityDialog } from './LogActivityDialog';

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('en-GB') : '—';
}
function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB');
}

export function ContactDrawer({
  contactId,
  onClose,
  onEdit,
}: {
  contactId: string | null;
  onClose: () => void;
  onEdit: (contact: IContact) => void;
}) {
  const { data: contact, isLoading } = useContact(contactId ?? undefined);
  const convert = useConvertContact();
  const deleteContact = useDeleteContact();
  const [logOpen, setLogOpen] = useState(false);

  const handleConvert = () => {
    if (contact && window.confirm(`Convert “${contact.name}” into a client?`)) {
      convert.mutate(contact.id);
    }
  };
  const handleDelete = () => {
    if (contact && window.confirm(`Delete “${contact.name}”?`)) {
      deleteContact.mutate(contact.id, { onSuccess: onClose });
    }
  };

  return (
    <Drawer
      anchor="right"
      open={Boolean(contactId)}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 460 } } }}
    >
      {isLoading || !contact ? (
        <Box sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" fontWeight={800} color={brand.ink}>
                {contact.name}
              </Typography>
              {contact.company && <Typography color={brand.inkSoft}>{contact.company}</Typography>}
            </Box>
            <IconButton onClick={onClose} size="small">
              <Icons.Close />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
            <Chip
              size="small"
              label={STAGE_LABELS[contact.stage]}
              color={STAGE_COLORS[contact.stage]}
            />
            {contact.convertedClientId && (
              <Chip size="small" color="success" variant="outlined" label="Converted" />
            )}
          </Stack>

          {/* Quick outreach */}
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <QuickAction label="Call" icon={<Icons.Phone />} href={telHref(contact.mobile)} />
            <QuickAction
              label="WhatsApp"
              icon={<Icons.WhatsApp />}
              href={whatsappHref(contact.whatsapp || contact.mobile)}
              color="#25D366"
            />
            <QuickAction label="Email" icon={<Icons.Email />} href={mailtoHref(contact.email)} />
          </Stack>

          {/* Meta */}
          <Stack spacing={1} sx={{ mt: 2.5 }}>
            <Meta label="Mobile" value={contact.mobile ?? '—'} />
            <Meta label="Email" value={contact.email ?? '—'} />
            <Meta label="Source" value={contact.source ?? '—'} />
            <Meta label="Assigned to" value={contact.assignedToName ?? 'Unassigned'} />
            <Meta label="Last contacted" value={fmtDate(contact.lastContactedAt)} />
            <Meta label="Next follow-up" value={fmtDate(contact.nextFollowUpAt)} />
          </Stack>

          {contact.tags.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              {contact.tags.map((tag) => (
                <Chip key={tag} size="small" variant="outlined" icon={<Icons.Tag />} label={tag} />
              ))}
            </Stack>
          )}

          {contact.notes && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color={brand.inkSoft}>
                Notes
              </Typography>
              <Typography color={brand.ink} sx={{ whiteSpace: 'pre-wrap' }}>
                {contact.notes}
              </Typography>
            </Box>
          )}

          {/* Actions */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2.5 }}>
            <Button variant="contained" startIcon={<Icons.Add />} onClick={() => setLogOpen(true)}>
              Log outreach
            </Button>
            <Button variant="outlined" startIcon={<Icons.Edit />} onClick={() => onEdit(contact)}>
              Edit
            </Button>
            {!contact.convertedClientId && (
              <Button
                variant="outlined"
                startIcon={<Icons.Convert />}
                onClick={handleConvert}
                disabled={convert.isPending}
              >
                Convert to client
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<Icons.Delete />}
              onClick={handleDelete}
              sx={{ color: '#d32f2f', borderColor: 'rgba(211,47,47,0.35)' }}
            >
              Delete
            </Button>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Activity timeline */}
          <Typography fontWeight={700} color={brand.ink} sx={{ mb: 1.5 }}>
            Activity ({contact.activities?.length ?? 0})
          </Typography>
          {(contact.activities ?? []).length === 0 ? (
            <Typography variant="body2" color={brand.inkSoft}>
              No outreach logged yet. Use “Log outreach” after a call or message.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {(contact.activities ?? []).map((a) => {
                const meta = ACTIVITY_TYPE_META[a.type];
                const Icon = Icons[meta.icon];
                return (
                  <Stack key={a.id} direction="row" spacing={1.5}>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        flexShrink: 0,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'rgba(110,86,207,0.1)',
                        color: brand.purple,
                      }}
                    >
                      <Icon fontSize="small" />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography fontWeight={600} color={brand.ink}>
                          {meta.label}
                        </Typography>
                        {a.outcome && (
                          <Chip size="small" variant="outlined" label={OUTCOME_LABELS[a.outcome]} />
                        )}
                      </Stack>
                      {a.note && (
                        <Typography
                          variant="body2"
                          color={brand.ink}
                          sx={{ whiteSpace: 'pre-wrap' }}
                        >
                          {a.note}
                        </Typography>
                      )}
                      <Typography variant="caption" color={brand.inkSoft}>
                        {fmtDateTime(a.occurredAt)}
                        {a.createdByName ? ` · ${a.createdByName}` : ''}
                        {a.nextFollowUpAt ? ` · follow-up ${fmtDate(a.nextFollowUpAt)}` : ''}
                      </Typography>
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Box>
      )}

      <LogActivityDialog open={logOpen} contactId={contactId} onClose={() => setLogOpen(false)} />
    </Drawer>
  );
}

function QuickAction({
  label,
  icon,
  href,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  href: string | null;
  color?: string;
}) {
  return (
    <Tooltip title={href ? label : `No ${label.toLowerCase()} on file`}>
      <span>
        <Button
          variant="outlined"
          size="small"
          startIcon={icon}
          disabled={!href}
          component="a"
          href={href ?? undefined}
          target={label === 'WhatsApp' ? '_blank' : undefined}
          sx={color ? { color, '& .MuiButton-startIcon': { color } } : undefined}
        >
          {label}
        </Button>
      </span>
    </Tooltip>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" color={brand.inkSoft}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        color={brand.ink}
        sx={{ textAlign: 'right', wordBreak: 'break-word' }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
