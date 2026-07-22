import { useState } from 'react';
import { Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { IQuote } from '@agencyos/shared';
import { Icons } from '@/lib/iconHash';
import { useCreateInvoiceFromQuote } from '@/features/invoices/hooks';
import { useDeleteQuote, useUpdateQuoteStatus } from '../hooks';
import { NEXT_STATUSES, STATUS_LABELS } from '../constant/quoteOptions';

export function QuoteRowActions({ quote }: { quote: IQuote }) {
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const updateStatus = useUpdateQuoteStatus();
  const deleteQuote = useDeleteQuote();
  const convertToInvoice = useCreateInvoiceFromQuote();
  const nextStatuses = NEXT_STATUSES[quote.status] ?? [];
  const canConvert =
    !quote.invoiceId && (quote.status === 'ACCEPTED' || quote.status === 'CONVERTED');

  const close = () => setAnchor(null);

  const handleDelete = () => {
    close();
    if (window.confirm(`Delete quotation ${quote.number}?`)) {
      deleteQuote.mutate(quote.id);
    }
  };

  const handleConvert = () => {
    close();
    convertToInvoice.mutate(quote.id, {
      onSuccess: (invoice) => navigate(`/invoices/${invoice.id}`),
    });
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
        {quote.invoiceId && (
          <MenuItem
            onClick={() => {
              close();
              navigate(`/invoices/${quote.invoiceId}`);
            }}
          >
            <ListItemIcon>
              <Icons.Receipt fontSize="small" />
            </ListItemIcon>
            View invoice {quote.invoiceNumber}
          </MenuItem>
        )}
        {canConvert && (
          <MenuItem onClick={handleConvert}>
            <ListItemIcon>
              <Icons.Receipt fontSize="small" />
            </ListItemIcon>
            Convert to invoice
          </MenuItem>
        )}
        <Divider />
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
