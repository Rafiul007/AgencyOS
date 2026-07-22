import type { ContactsWorkspace } from '../useContactsWorkspace';
import { ContactDrawer } from './ContactDrawer';
import { ContactDialog } from './ContactDialog';
import { ImportContactsDialog } from './ImportContactsDialog';

/** The drawer + create/edit + import dialogs, shared by both Contacts pages. */
export function ContactsDialogs({ ws }: { ws: ContactsWorkspace }) {
  return (
    <>
      <ContactDrawer
        contactId={ws.selectedId}
        onClose={() => ws.setSelectedId(null)}
        onEdit={ws.openEdit}
      />
      <ContactDialog
        open={ws.dialogOpen}
        contact={ws.editing}
        onClose={() => ws.setDialogOpen(false)}
      />
      <ImportContactsDialog open={ws.importOpen} onClose={() => ws.setImportOpen(false)} />
    </>
  );
}
