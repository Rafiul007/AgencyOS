import { useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserRole, type IApiError, type ITeamMember } from '@agencyos/shared';
import { RhfTextField } from '@/components/rhf/RhfTextField';
import { RhfSelect } from '@/components/rhf/RhfSelect';
import { brand } from '@/lib/theme';
import { useCreateMember, useUpdateMember } from '../hooks';
import { ROLE_OPTIONS } from '../constant/teamOptions';

const createSchema = z.object({
  name: z.string().min(2, 'Enter a name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean(),
});
type Values = z.infer<typeof createSchema>;

const EMPTY: Values = {
  name: '',
  email: '',
  password: '',
  role: UserRole.AGENT,
  isActive: true,
};

export function MemberDialog({
  open,
  member,
  onClose,
}: {
  open: boolean;
  member: ITeamMember | null;
  onClose: () => void;
}) {
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const isEdit = Boolean(member);
  const methods = useForm<Values>({ resolver: zodResolver(createSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) {
      methods.reset(
        member
          ? {
              name: member.name,
              email: member.email,
              password: '',
              role: member.role,
              isActive: member.isActive,
            }
          : EMPTY,
      );
    }
  }, [open, member, methods]);

  const error = (createMember.error || updateMember.error) as unknown as IApiError | null;

  const onSubmit = methods.handleSubmit(async (values) => {
    if (member) {
      await updateMember.mutateAsync({
        id: member.id,
        input: { role: values.role, isActive: values.isActive },
      });
    } else {
      await createMember.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
    }
    onClose();
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle fontWeight={800}>{isEdit ? 'Edit member' : 'Add team member'}</DialogTitle>
      <FormProvider {...methods}>
        <Box component="form" onSubmit={onSubmit} noValidate>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              {isEdit ? (
                <Box>
                  <Typography fontWeight={700} color={brand.ink}>
                    {member?.name}
                  </Typography>
                  <Typography variant="body2" color={brand.inkSoft}>
                    {member?.email}
                  </Typography>
                </Box>
              ) : (
                <>
                  <RhfTextField name="name" label="Full name" />
                  <RhfTextField name="email" label="Email" type="email" />
                  <RhfTextField name="password" label="Temporary password" type="password" />
                </>
              )}
              <RhfSelect name="role" label="Role" options={ROLE_OPTIONS} />
              {isEdit && (
                <Controller
                  control={methods.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label={field.value ? 'Active (can log in)' : 'Deactivated (cannot log in)'}
                    />
                  )}
                />
              )}
              {!isEdit && (
                <Typography variant="caption" color={brand.inkSoft}>
                  Share the temporary password with your teammate — they can change it after logging
                  in.
                </Typography>
              )}
              {error && <Alert severity="error">{error.message}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} variant="text" sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMember.isPending || updateMember.isPending}
            >
              {isEdit ? 'Save changes' : 'Add member'}
            </Button>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  );
}
