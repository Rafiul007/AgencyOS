import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { parseCsv, toCsv, downloadCsv } from '@/lib/csv';
import { brand } from '@/lib/theme';
import { Icons } from '@/lib/iconHash';
import { useImportContacts } from '../hooks';
import type { IContactInput } from '../api';

/** Column aliases → contact field. Header matching is case-insensitive. */
const FIELD_ALIASES: Record<string, keyof IContactInput> = {
  name: 'name',
  'full name': 'name',
  contact: 'name',
  company: 'company',
  organisation: 'company',
  organization: 'company',
  email: 'email',
  mobile: 'mobile',
  phone: 'mobile',
  'phone number': 'mobile',
  whatsapp: 'whatsapp',
  source: 'source',
  tags: 'tags',
  notes: 'notes',
  note: 'notes',
};

function rowsToContacts(matrix: string[][]): IContactInput[] {
  if (matrix.length < 2) return [];
  const header = matrix[0].map((h) => h.trim().toLowerCase());
  const cols = header.map((h) => FIELD_ALIASES[h]);
  return matrix
    .slice(1)
    .map((cells) => {
      const c: IContactInput = { name: '' };
      cols.forEach((field, i) => {
        if (!field) return;
        const value = (cells[i] ?? '').trim();
        if (!value) return;
        if (field === 'tags') {
          c.tags = value
            .split(/[;|]/)
            .map((t) => t.trim())
            .filter(Boolean);
        } else {
          c[field] = value as never;
        }
      });
      return c;
    })
    .filter((c) => c.name.trim().length > 0);
}

export function ImportContactsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const importContacts = useImportContacts();
  const [text, setText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const contacts = useMemo(() => (text.trim() ? rowsToContacts(parseCsv(text)) : []), [text]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setText(await file.text());
    setResult(null);
    setError(null);
  };

  const downloadTemplate = () => {
    const csv = toCsv(
      ['name', 'company', 'email', 'mobile', 'whatsapp', 'source', 'tags', 'notes'],
      [
        [
          'Rahim Uddin',
          'Rahim Traders',
          'rahim@example.com',
          '01712345678',
          '01712345678',
          'Facebook',
          'retail;dhaka',
          'Met at expo',
        ],
      ],
    );
    downloadCsv('contacts-template.csv', csv);
  };

  const handleImport = async () => {
    setError(null);
    try {
      const res = await importContacts.mutateAsync(contacts);
      setResult(`Imported ${res.created} contact${res.created === 1 ? '' : 's'}.`);
      setText('');
    } catch {
      setError('Import failed. Check your file and try again.');
    }
  };

  const close = () => {
    setText('');
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle fontWeight={800}>Import contacts</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Typography variant="body2" color={brand.inkSoft}>
            Upload a CSV with a header row. Recognised columns: name, company, email, mobile,
            whatsapp, source, tags, notes. Separate multiple tags with <code>;</code>.{' '}
            <Link component="button" type="button" onClick={downloadTemplate}>
              Download template
            </Link>
          </Typography>

          <Button variant="outlined" component="label" startIcon={<Icons.Upload />}>
            Choose CSV file
            <input
              hidden
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </Button>

          <Box
            component="textarea"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setResult(null);
            }}
            placeholder="…or paste CSV rows here"
            sx={{
              width: '100%',
              minHeight: 120,
              p: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              fontFamily: 'monospace',
              fontSize: 13,
              resize: 'vertical',
            }}
          />

          {contacts.length > 0 && (
            <Alert severity="info">
              {contacts.length} valid contact{contacts.length === 1 ? '' : 's'} detected.
            </Alert>
          )}
          {result && <Alert severity="success">{result}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={close} variant="text" sx={{ color: 'text.secondary' }}>
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<Icons.Upload />}
          disabled={contacts.length === 0 || importContacts.isPending}
          onClick={handleImport}
        >
          Import {contacts.length > 0 ? `(${contacts.length})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
