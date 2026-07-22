import { useState } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { ContactStage, type IContact } from '@agencyos/shared';
import { brand } from '@/lib/theme';
import { Icons } from '@/lib/iconHash';
import { STAGE_ACCENT, STAGE_LABELS, STAGE_ORDER } from '../constant/contactOptions';

function isOverdue(iso: string | null): boolean {
  return Boolean(iso && new Date(iso).getTime() < Date.now());
}

/**
 * Pipeline board. Cards are dragged between stage columns using native HTML5
 * drag-and-drop (no extra dependency); dropping calls `onMove`.
 */
export function ContactsBoard({
  contacts,
  onOpen,
  onMove,
  fullHeight = false,
}: {
  contacts: IContact[];
  onOpen: (contact: IContact) => void;
  onMove: (id: string, stage: ContactStage) => void;
  /** Stretch columns to fill the parent height; each column scrolls its own cards. */
  fullHeight?: boolean;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<ContactStage | null>(null);

  const byStage = (stage: ContactStage) => contacts.filter((c) => c.stage === stage);

  const handleDrop = (stage: ContactStage) => {
    if (draggingId) {
      const moving = contacts.find((c) => c.id === draggingId);
      if (moving && moving.stage !== stage) onMove(draggingId, stage);
    }
    setDraggingId(null);
    setOverStage(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        overflowX: 'auto',
        pb: 1,
        alignItems: 'stretch',
        ...(fullHeight ? { height: '100%' } : {}),
      }}
    >
      {STAGE_ORDER.map((stage) => {
        const items = byStage(stage);
        const isOver = overStage === stage;
        return (
          <Box
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStage(stage);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={() => handleDrop(stage)}
            sx={{
              width: 280,
              flexShrink: 0,
              borderRadius: 3,
              border: 1,
              borderColor: isOver ? brand.purple : 'divider',
              bgcolor: isOver ? 'rgba(110,86,207,0.04)' : '#fbfbfd',
              transition: 'border-color 120ms ease, background 120ms ease',
              ...(fullHeight ? { display: 'flex', flexDirection: 'column', height: '100%' } : {}),
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                px: 2,
                py: 1.25,
                borderTop: `3px solid ${STAGE_ACCENT[stage]}`,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              }}
            >
              <Typography fontWeight={700} color={brand.ink}>
                {STAGE_LABELS[stage]}
              </Typography>
              <Chip size="small" label={items.length} />
            </Stack>

            <Stack
              spacing={1.25}
              sx={{
                p: 1.25,
                minHeight: 80,
                ...(fullHeight ? { flexGrow: 1, overflowY: 'auto' } : {}),
              }}
            >
              {items.map((contact) => (
                <Box
                  key={contact.id}
                  draggable
                  onDragStart={() => setDraggingId(contact.id)}
                  onDragEnd={() => setDraggingId(null)}
                  onClick={() => onOpen(contact)}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: '#fff',
                    cursor: 'grab',
                    opacity: draggingId === contact.id ? 0.5 : 1,
                    '&:hover': { borderColor: brand.purple },
                  }}
                >
                  <Typography fontWeight={700} color={brand.ink} noWrap>
                    {contact.name}
                  </Typography>
                  {contact.company && (
                    <Typography variant="body2" color={brand.inkSoft} noWrap>
                      {contact.company}
                    </Typography>
                  )}
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mt: 0.75 }}
                  >
                    {contact.mobile && (
                      <Typography variant="caption" color={brand.inkSoft}>
                        {contact.mobile}
                      </Typography>
                    )}
                    {contact.activityCount ? (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`${contact.activityCount} touches`}
                      />
                    ) : null}
                    {isOverdue(contact.nextFollowUpAt) && (
                      <Chip
                        size="small"
                        color="warning"
                        icon={<Icons.Bell sx={{ fontSize: 14 }} />}
                        label="Due"
                      />
                    )}
                  </Stack>
                  {contact.tags.length > 0 && (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      flexWrap="wrap"
                      useFlexGap
                      sx={{ mt: 0.75 }}
                    >
                      {contact.tags.slice(0, 3).map((tag) => (
                        <Chip key={tag} size="small" variant="outlined" label={tag} />
                      ))}
                    </Stack>
                  )}
                </Box>
              ))}
              {items.length === 0 && (
                <Typography variant="caption" color={brand.inkSoft} sx={{ px: 1, py: 2 }}>
                  Drop contacts here
                </Typography>
              )}
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
}
