import type { FieldDef } from './form-fields';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import { useResource, saveSingleton } from '../api';
import { FormFields, buildSchema, toFormValues, fromFormValues } from './form-fields';

// ----------------------------------------------------------------------

type Props = {
  /** Singleton endpoint (profile or settings). Only the listed fields are sent. */
  url: string;
  title: string;
  subheader?: string;
  fields: FieldDef[];
};

/** Edits a subset of a singleton record (e.g. the hero fields of the profile). */
export function SingletonForm<T extends Record<string, any>>({
  url,
  title,
  subheader,
  fields,
}: Props) {
  const { data, isLoading } = useResource<T>(url);

  const methods = useForm({
    resolver: zodResolver(buildSchema(fields)),
    defaultValues: toFormValues(fields, data),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = methods;

  useEffect(() => {
    if (data) reset(toFormValues(fields, data));
  }, [data, fields, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const saved = await saveSingleton<T>(url, fromFormValues(fields, values) as Partial<T>);
      reset(toFormValues(fields, saved));
      toast.success('Saved — the website is updated');
    } catch (error) {
      toast.error((error as Error).message);
    }
  });

  return (
    <Card>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 2 }} />
      <Divider />
      <CardContent>
        {isLoading ? (
          <Stack spacing={2}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rounded" height={56} />
            ))}
          </Stack>
        ) : (
          <Form methods={methods} onSubmit={onSubmit}>
            <FormFields fields={fields} />
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
                Save changes
              </Button>
            </Stack>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
