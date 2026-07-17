import { TextField, type TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

type RhfTextFieldProps = Omit<TextFieldProps, 'name'> & { name: string };

/**
 * RHF-wrapped MUI TextField. Forms use these wrappers instead of raw MUI inputs,
 * so validation and form state are wired consistently everywhere.
 */
export function RhfTextField({ name, ...rest }: RhfTextFieldProps) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
          fullWidth
          {...rest}
        />
      )}
    />
  );
}
