import { useState } from 'react';
import { IconButton, ListItemIcon, Menu, MenuItem, Tooltip } from '@mui/material';
import type { IQuote } from '@agencyos/shared';
import { Icons } from '@/lib/iconHash';
import { useDeleteQuote, useUpdateQuoteStatus } from '../hooks';
import { NEXT_STATUSES, STATUS_LABELS } from '../constant/quoteOptions';

export function QuoteRowActions({ quote }: { quote: IQuote }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const updateStatus = useUpdateQuoteStatus();
  const deleteQuote = useDeleteQuote();
  const nextStatuses = NEXT_STATUSES[quote.status] ?? [];

  const close = () => setAnchor(null);

  const handleDelete = () => {
    close();
    if (window.confirm(`Delete quotation ${quote.number}?`)) {
      deleteQuote.mutate(quote.id);
    }
  };

  return (
    <>
      <Tooltip title="Actions">
        <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
          <Icons.Menu fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
        {nextStatuses.map((status) => (
          <MenuItem
            key={status}
            onClick={() => {
              close();
              updateStatus.mutate({ id: quote.id, status });
            }}
          >
            <ListItemIcon>
              <Icons.Check fontSize="small" />
            </ListItemIcon>
            Mark as {STATUS_LABELS[status]}
          </MenuItem>
        ))}
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <Icons.Delete fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}
