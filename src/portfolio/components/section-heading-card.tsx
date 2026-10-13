import type { FieldDef } from './form-fields';
import type { Section, SectionKey } from '../types';

import { mutate } from 'swr';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import axios from 'src/lib/axios';

import { Label } from 'src/components/label';
import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import { api, useResource } from '../api';
import { FormFields, buildSchema, toFormValues, fromFormValues } from './form-fields';

// ----------------------------------------------------------------------

const FIELDS: FieldDef[] = [
  { name: 'visible', label: 'Show this section on the website', type: 'switch', half: true },
  { name: 'showInNav', label: 'Show in the top navigation', type: 'switch', half: true },
  { name: 'navLabel', label: 'Navigation label', half: true },
  { name: 'eyebrow', label: 'Small label above the heading', half: true },
  { name: 'title', label: 'Heading', half: true, placeholder: 'Projects I’m' },
  { name: 'highlight', label: 'Highlighted (italic) words', half: true, placeholder: 'proud of' },
  { name: 'titleSuffix', label: 'Text after highlight', half: true, placeholder: '.' },
];

const HOME_FIELDS = FIELDS.filter((f) => ['visible', 'showInNav', 'navLabel'].includes(f.name));

export async function saveSection(key: SectionKey, body: Partial<Section>) {
  await axios.put(`${api.sections}/${key}`, body);
  await mutate(api.sections);
}

/** On/off toggle, nav label and heading copy for one website section. */
export function SectionHeadingCard({ sectionKey }: { sectionKey: SectionKey }) {
  const { data } = useResource<Section[]>(api.sections);
  const section = data?.find((s) => s.key === sectionKey);
  const fields = sectionKey === 'home' ? HOME_FIELDS : FIELDS;

  const methods = useForm({
    resolver: zodResolver(buildSchema(fields)),
    defaultValues: toFormValues(fields, section),
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = methods;

  useEffect(() => {
    if (section) reset(toFormValues(fields, section));
  }, [section, fields, reset]);

  const values = watch();

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      await saveSection(sectionKey, fromFormValues(fields, formValues) as Partial<Section>);
      toast.success('Section saved — the website is updated');
    } catch (error) {
      toast.error((error as Error).message);
    }
  });

  return (
    <Card>
      <CardHeader
        title="Section settings"
        subheader="Turn the whole section on or off and edit its heading."
        action={
          section && (
            <Label color={section.visible ? 'success' : 'default'} variant="soft">
              {section.visible ? 'Live on website' : 'Hidden'}
            </Label>
          )
        }
        sx={{ mb: 2 }}
      />
      <Divider />
      <CardContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <FormFields fields={fields} />

          {sectionKey !== 'home' && (
            <Box
              sx={{
                mt: 3,
                p: 2.5,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
              }}
            >
              <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                Preview
              </Typography>
              {values.eyebrow && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: 'warning.dark',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                  }}
                >
                  {values.eyebrow}
                </Typography>
              )}
              <Typography variant="h4" sx={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}>
                {values.title}{' '}
                <Box component="em" sx={{ color: 'warning.dark' }}>
                  {values.highlight}
                </Box>
                {values.titleSuffix}
              </Typography>
            </Box>
          )}

          <Stack direction="row" spacing={1.5} sx={{ mt: 3, justifyContent: 'flex-end' }}>
            <Button
              color="inherit"
              variant="outlined"
              disabled={!isDirty || isSubmitting}
              onClick={() => reset()}
            >
              Discard
            </Button>
            <Button type="submit" variant="contained" disabled={!isDirty} loading={isSubmitting}>
              Save section
            </Button>
          </Stack>
        </Form>
      </CardContent>
    </Card>
  );
}
