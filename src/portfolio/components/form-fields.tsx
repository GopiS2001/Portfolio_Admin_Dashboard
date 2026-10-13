import type { ZodType } from 'zod';

import * as z from 'zod';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';

import { Field } from 'src/components/hook-form';

import { LinksField } from './links-field';
import { UploadField } from './upload-field';

// ----------------------------------------------------------------------

/** Declarative form field — one list drives the form UI, defaults and validation. */
export type FieldDef = {
  name: string;
  label: string;
  type?:
    | 'text'
    | 'textarea'
    | 'tags'
    | 'lines'
    | 'switch'
    | 'select'
    | 'image'
    | 'file'
    | 'color'
    | 'links';
  required?: boolean;
  helperText?: string;
  placeholder?: string;
  options?: { value: string; label: string; css?: string }[];
  /** Half width on desktop. */
  half?: boolean;
  rows?: number;
  /** File picker filter for "file" fields (default: images and PDF). */
  accept?: string;
};

/** API value -> form value ("lines" are edited as one point per line). */
export function toFormValues(fields: FieldDef[], item?: Record<string, any> | null) {
  return Object.fromEntries(
    fields.map((f) => {
      const v = item?.[f.name];
      switch (f.type) {
        case 'switch':
          return [f.name, v ?? f.name === 'visible'];
        case 'tags':
        case 'links':
          return [f.name, Array.isArray(v) ? v : []];
        case 'lines':
          return [f.name, Array.isArray(v) ? v.join('\n') : ''];
        case 'select':
          return [f.name, v ?? f.options?.[0]?.value ?? ''];
        default:
          return [f.name, v ?? ''];
      }
    })
  );
}

/** Form value -> API value. */
export function fromFormValues(fields: FieldDef[], values: Record<string, any>) {
  return Object.fromEntries(
    fields.map((f) => {
      const v = values[f.name];
      if (f.type === 'lines') {
        return [
          f.name,
          String(v ?? '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        ];
      }
      if (f.type === 'links') {
        // Rows without a URL are dropped; a blank label falls back to "Live site".
        const rows: { label?: string; url?: string }[] = v ?? [];
        return [
          f.name,
          rows
            .map((l) => ({ label: (l.label ?? '').trim(), url: (l.url ?? '').trim() }))
            .filter((l) => l.url)
            .map((l) => ({ ...l, label: l.label || 'Live site' })),
        ];
      }
      if (f.type === 'tags')
        return [f.name, (v ?? []).map((t: string) => t.trim()).filter(Boolean)];
      if (typeof v === 'string') return [f.name, v.trim()];
      return [f.name, v];
    })
  );
}

export function buildSchema(fields: FieldDef[]) {
  const shape: Record<string, ZodType> = {};
  for (const f of fields) {
    if (f.type === 'switch') shape[f.name] = z.boolean();
    else if (f.type === 'tags') shape[f.name] = z.array(z.string());
    else if (f.type === 'links')
      shape[f.name] = z.array(z.object({ label: z.string(), url: z.string() }));
    else if (f.required)
      shape[f.name] = z
        .string()
        .trim()
        .min(1, { error: `${f.label} is required` });
    else shape[f.name] = z.string().nullable().optional();
  }
  return z.object(shape);
}

// ----------------------------------------------------------------------

export function FormField({ field }: { field: FieldDef }) {
  const { name, label, helperText, placeholder } = field;
  const common = { name, label, helperText, placeholder };

  switch (field.type) {
    case 'textarea':
    case 'lines':
      return (
        <Field.Text
          {...common}
          multiline
          minRows={field.rows ?? 3}
          helperText={helperText ?? (field.type === 'lines' ? 'One item per line' : undefined)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      );

    case 'switch':
      return <Field.Switch name={name} label={label} helperText={helperText} />;

    case 'select':
      return (
        <Field.Select {...common} slotProps={{ inputLabel: { shrink: true } }}>
          {field.options?.map((o) => (
            <MenuItem key={o.value} value={o.value} sx={{ gap: 1.5, textTransform: 'none' }}>
              {o.css && (
                <Box
                  component="span"
                  sx={{
                    width: 28,
                    height: 16,
                    borderRadius: 0.75,
                    flexShrink: 0,
                    background: `linear-gradient(135deg, ${o.css})`,
                  }}
                />
              )}
              {o.label}
            </MenuItem>
          ))}
        </Field.Select>
      );

    case 'tags':
      return (
        <Field.Autocomplete
          name={name}
          label={label}
          placeholder={placeholder ?? 'Type and press Enter'}
          helperText={helperText}
          multiple
          freeSolo
          disableClearable
          options={[]}
          renderValue={(selected: string[], getItemProps) =>
            selected.map((option, index) => (
              <Chip
                {...getItemProps({ index })}
                key={option}
                label={option}
                size="small"
                variant="soft"
              />
            ))
          }
          slotProps={{ textField: { slotProps: { inputLabel: { shrink: true } } } }}
        />
      );

    case 'image':
    case 'file':
      return (
        <UploadField
          name={name}
          label={label}
          helperText={helperText}
          kind={field.type}
          accept={field.accept}
        />
      );

    case 'links':
      return <LinksField name={name} label={label} helperText={helperText} />;

    case 'color':
      return (
        <Field.Text
          {...common}
          type="color"
          slotProps={{ inputLabel: { shrink: true }, htmlInput: { sx: { height: 24 } } }}
        />
      );

    default:
      return <Field.Text {...common} slotProps={{ inputLabel: { shrink: true } }} />;
  }
}

/** Two-column responsive grid of fields. */
export function FormFields({ fields }: { fields: FieldDef[] }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
      }}
    >
      {fields.map((f) => (
        <Box key={f.name} sx={{ gridColumn: { md: f.half ? 'span 1' : 'span 2' } }}>
          <FormField field={f} />
        </Box>
      ))}
    </Box>
  );
}
