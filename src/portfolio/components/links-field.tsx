import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  name: string;
  label: string;
  helperText?: string;
};

/** Repeatable "button label + URL" rows (e.g. Admin dashboard → https://…). */
export function LinksField({ name, label, helperText }: Props) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box>
        <Typography variant="subtitle2">{label}</Typography>
        {helperText && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {helperText}
          </Typography>
        )}
      </Box>

      {fields.map((item, index) => (
        <Box key={item.id} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Field.Text
            name={`${name}.${index}.label`}
            label="Button label"
            placeholder="Admin dashboard"
            sx={{ flex: '0 0 38%' }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Field.Text
            name={`${name}.${index}.url`}
            label="URL"
            placeholder="https://admin.example.com"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <IconButton aria-label="Remove link" onClick={() => remove(index)} sx={{ mt: 1 }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Box>
      ))}

      <Button
        size="small"
        variant="soft"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => append({ label: '', url: '' })}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add link
      </Button>
    </Box>
  );
}
