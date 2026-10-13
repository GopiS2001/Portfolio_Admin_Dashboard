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
      const res = await axios.put<{ signedOutOtherSessions: number }>(api.password, {
        currentPassword,
        newPassword,
      });
      password.reset();
      const others = res.data.signedOutOtherSessions;
      toast.success(
        others
          ? `Password changed — signed out ${others} other session${others === 1 ? '' : 's'}`
          : 'Password changed'
      );
      await mutate(api.sessions);
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

        <Grid size={12}>
          <SessionsCard />
        </Grid>
      </Grid>
    </PageShell>
  );
}

// ----------------------------------------------------------------------

type SessionRow = {
  id: string;
  client: 'dashboard' | 'website' | 'native';
  userAgent: string;
  ip: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  current: boolean;
};

const CLIENT_LABEL = { dashboard: 'Admin dashboard', website: 'Website', native: 'Mobile app' } as const;
const CLIENT_ICON = {
  dashboard: 'solar:monitor-bold',
  website: 'eva:globe-2-fill',
  native: 'solar:smartphone-bold',
} as const;

/** "Chrome on Windows" from a user-agent string (good enough to recognise your devices). */
function describeDevice(ua: string) {
  if (!ua) return 'Unknown device';
  const browser =
    (/Edg\//.test(ua) && 'Edge') ||
    (/OPR\//.test(ua) && 'Opera') ||
    (/Chrome\//.test(ua) && 'Chrome') ||
    (/Firefox\//.test(ua) && 'Firefox') ||
    (/Safari\//.test(ua) && 'Safari') ||
    (/Expo|okhttp|CFNetwork|Dalvik/i.test(ua) && 'App') ||
    'Browser';
  const os =
    (/Windows/.test(ua) && 'Windows') ||
    (/Android/.test(ua) && 'Android') ||
    (/iPhone|iPad|iOS/.test(ua) && 'iOS') ||
    (/Mac OS X|Macintosh/.test(ua) && 'macOS') ||
    (/Linux/.test(ua) && 'Linux') ||
    '';
  return os ? `${browser} on ${os}` : browser;
}

/** Every signed-in device, with sign-out per device or for all others. */
function SessionsCard() {
  const { data, isLoading } = useResource<SessionRow[]>(api.sessions);
  const sessions = data ?? [];
  const others = sessions.filter((s) => !s.current).length;

  const revoke = async (session: SessionRow) => {
    try {
      await axios.delete(`${api.sessions}/${session.id}`);
      await mutate(api.sessions);
      toast.success(`Signed out ${CLIENT_LABEL[session.client]} session`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const revokeOthers = async () => {
    try {
      const res = await axios.post<{ revoked: number }>(`${api.sessions}/revoke-others`);
      await mutate(api.sessions);
      toast.success(`Signed out ${res.data.revoked} other session${res.data.revoked === 1 ? '' : 's'}`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Where you're signed in"
        subheader="Sessions stay active for 7 days after their last use. Sign out any you don't recognise."
        action={
          <Button color="error" variant="soft" disabled={!others} onClick={revokeOthers}>
            Sign out other devices
          </Button>
        }
        sx={{ mb: 2 }}
      />
      <Divider />
      {isLoading && (
        <Stack spacing={1.5} sx={{ p: 3 }}>
          {[0, 1].map((i) => (
            <Skeleton key={i} variant="rounded" height={56} />
          ))}
        </Stack>
      )}
      <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
        {sessions.map((s) => (
          <Box key={s.id} sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'background.neutral',
                color: s.current ? 'primary.main' : 'text.secondary',
              }}
            >
              <Iconify icon={CLIENT_ICON[s.client]} width={24} />
            </Box>
            <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {CLIENT_LABEL[s.client]} · {describeDevice(s.userAgent)}
                {s.current && (
                  <Label color="success" sx={{ ml: 1 }}>
                    This device
                  </Label>
                )}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {s.ip || 'Unknown IP'} · Active {fToNow(s.lastUsedAt)} ago · Signed in{' '}
                {fDateTime(s.createdAt)}
              </Typography>
            </Box>
            {!s.current && (
              <Button size="small" color="error" onClick={() => revoke(s)}>
                Sign out
              </Button>
            )}
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
