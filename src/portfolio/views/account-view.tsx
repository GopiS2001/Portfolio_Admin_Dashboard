import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import axios from 'src/lib/axios';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';

import { api } from '../api';
import { PageShell } from '../components/page-shell';

// ----------------------------------------------------------------------

const AccountSchema = z.object({
  displayName: z.string().trim().min(1, { error: 'Name is required' }),
  email: z.email({ error: 'Enter a valid email' }),
});

const PasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: 'Current password is required' }),
    newPassword: z.string().min(6, { error: 'At least 6 characters' }),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function AccountView() {
  const { user, checkUserSession } = useAuthContext();

  const account = useForm({
    resolver: zodResolver(AccountSchema),
    values: { displayName: user?.displayName ?? '', email: user?.email ?? '' },
  });

  const password = useForm({
    resolver: zodResolver(PasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const saveAccount = account.handleSubmit(async (values) => {
    try {
      await axios.put(api.account, values);
      await checkUserSession?.();
      toast.success('Account updated');
    } catch (error) {
      toast.error((error as Error).message);
    }
  });

  const savePassword = password.handleSubmit(async ({ currentPassword, newPassword }) => {
    try {
      await axios.put(api.password, { currentPassword, newPassword });
      password.reset();
      toast.success('Password changed');
    } catch (error) {
      toast.error((error as Error).message);
    }
  });

  return (
    <PageShell heading="Account">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              title="Admin account"
              subheader="Used to sign in to this dashboard."
              sx={{ mb: 2 }}
            />
            <Divider />
            <CardContent>
              <Form methods={account} onSubmit={saveAccount}>
                <Stack spacing={3}>
                  <Field.Text name="displayName" label="Name" />
                  <Field.Text name="email" label="Email (login)" />
                  <Button
                    type="submit"
                    variant="contained"
                    loading={account.formState.isSubmitting}
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    Save account
                  </Button>
                </Stack>
              </Form>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Change password" sx={{ mb: 2 }} />
            <Divider />
            <CardContent>
              <Form methods={password} onSubmit={savePassword}>
                <Stack spacing={3}>
                  <Field.Text name="currentPassword" label="Current password" type="password" />
                  <Field.Text name="newPassword" label="New password" type="password" />
                  <Field.Text name="confirmPassword" label="Confirm new password" type="password" />
                  <Button
                    type="submit"
                    variant="contained"
                    loading={password.formState.isSubmitting}
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    Change password
                  </Button>
                </Stack>
              </Form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageShell>
  );
}
