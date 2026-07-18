import { MenuItem, TextField, type TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

export interface IRhfSelectOption {
  value: string;
  label: string;
}

type RhfSelectProps = Omit<TextFieldProps, 'name' | 'select'> & {
  name: string;
  options: IRhfSelectOption[];
};

/** RHF-wrapped MUI select. Used in forms instead of a raw MUI select. */
export function RhfSelect({ name, options, ...rest }: RhfSelectProps) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          select
          fullWidth
          size="small"
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
          {...rest}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
