import type { ReactNode } from 'react';
import { Button, Chip, MenuItem, Stack, TextField } from '@mui/material';
import { Icons } from '@/lib/iconHash';
import type { ContactsWorkspace } from '../useContactsWorkspace';

/** Shared action bar + filters for the Contacts table and board pages. */
export function ContactsToolbar({ ws, extra }: { ws: ContactsWorkspace; extra?: ReactNode }) {
  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      justifyContent="space-between"
      alignItems={{ lg: 'center' }}
      spacing={2}
      sx={{ mb: 2.5 }}
    >
      <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
        <Button variant="contained" startIcon={<Icons.Add />} onClick={ws.openCreate}>
          Add contact
        </Button>
        <Button
          variant="outlined"
          startIcon={<Icons.Upload />}
          onClick={() => ws.setImportOpen(true)}
        >
          Import
        </Button>
        <Button variant="outlined" startIcon={<Icons.Download />} onClick={ws.exportCsv}>
          Export
        </Button>
      </Stack>

      <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap alignItems="center">
        <TextField
          size="small"
          placeholder="Search name, email, phone…"
          value={ws.search}
          onChange={(e) => ws.setSearch(e.target.value)}
          sx={{ minWidth: 220, '& .MuiInputBase-root': { borderRadius: 999 } }}
        />
        <TextField
          select
          size="small"
          label="Owner"
          value={ws.assignee}
          onChange={(e) => ws.setAssignee(e.target.value)}
          sx={{ minWidth: 150, '& .MuiInputBase-root': { borderRadius: 999 } }}
        >
          <MenuItem value="">Everyone</MenuItem>
          {ws.users.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.name}
            </MenuItem>
          ))}
        </TextField>
        <Chip
          icon={<Icons.Bell />}
          label={
            ws.dueOnly
              ? 'Due follow-ups'
              : `Due follow-ups${ws.dueCount ? ` (${ws.dueCount})` : ''}`
          }
          color={ws.dueOnly ? 'warning' : 'default'}
          variant={ws.dueOnly ? 'filled' : 'outlined'}
          onClick={() => ws.setDueOnly(!ws.dueOnly)}
          sx={{ cursor: 'pointer' }}
        />
        {extra}
      </Stack>
    </Stack>
  );
}
