import type { Message, Section, Summary, Settings } from '../types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fToNow } from 'src/utils/format-time';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

import { api, useResource } from '../api';
import { SECTION_LABELS } from '../options';

// ----------------------------------------------------------------------

type IconName = React.ComponentProps<typeof Iconify>['icon'];

function StatCard({
  title,
  value,
  icon,
  color,
  href,
}: {
  title: string;
  value?: number;
  icon: IconName;
  color: 'primary' | 'info' | 'warning' | 'error' | 'success' | 'secondary';
  href: string;
}) {
  return (
    <Card
      component={RouterLink}
      href={href}
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2.5,
        textDecoration: 'none',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.vars.customShadows.z12,
        },
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          flexShrink: 0,
          borderRadius: 1.5,
          display: 'grid',
          placeItems: 'center',
          color: `${color}.main`,
          bgcolor: (theme) => `rgba(${theme.vars.palette[color].mainChannel} / 0.12)`,
        }}
      >
        <Iconify icon={icon} width={28} />
      </Box>
      <Box>
        <Typography variant="h3">{value ?? '–'}</Typography>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          {title}
        </Typography>
      </Box>
    </Card>
  );
}

export function OverviewView() {
  const { user } = useAuthContext();
  const { data: summary, error } = useResource<Summary>(api.summary);
  const { data: settings } = useResource<Settings>(api.settings);
  const { data: sections } = useResource<Section[]>(api.sections);
  const { data: messages } = useResource<Message[]>(api.messages);

  const shortcuts = [
    {
      label: 'Edit hero',
      href: paths.dashboard.portfolio.home,
      icon: 'solar:pen-bold' as IconName,
    },
    {
      label: 'Add project',
      href: paths.dashboard.portfolio.projects,
      icon: 'mingcute:add-line' as IconName,
    },
    {
      label: 'Update skills',
      href: paths.dashboard.portfolio.skills,
      icon: 'solar:atom-bold-duotone' as IconName,
    },
    {
      label: 'Configuration',
      href: paths.dashboard.portfolio.configuration,
      icon: 'solar:settings-bold' as IconName,
    },
  ];

  return (
    <DashboardContent maxWidth="xl">
      <Card
        sx={{
          p: { xs: 3, md: 5 },
          mb: 3,
          color: 'common.white',
          background: (theme) =>
            `linear-gradient(135deg, ${theme.vars.palette.primary.dark}, ${theme.vars.palette.primary.main})`,
        }}
      >
        <Typography variant="h4">Welcome back, {user?.displayName ?? 'admin'} 👋</Typography>
        <Typography sx={{ mt: 1, opacity: 0.8, maxWidth: 560 }}>
          Everything you change here goes live on your portfolio immediately — and is saved as an
          offline copy so the website keeps working even if the server stops.
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ mt: 3, flexWrap: 'wrap', gap: 1.5 }}>
          <Button
            variant="contained"
            color="inherit"
            href={CONFIG.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<Iconify icon="eva:external-link-fill" />}
            sx={{ color: 'grey.800', bgcolor: 'common.white', '&:hover': { bgcolor: 'grey.200' } }}
          >
            Open website
          </Button>
          {settings && (
            <Label
              variant="filled"
              color={settings.siteEnabled ? 'success' : 'error'}
              sx={{ height: 36, px: 2 }}
            >
              {settings.siteEnabled ? 'Website online' : 'Website in maintenance'}
            </Label>
          )}
        </Stack>
      </Card>

      {error && (
        <Card sx={{ p: 3, mb: 3, bgcolor: 'error.lighter', color: 'error.darker' }}>
          Cannot reach the API at {CONFIG.serverUrl}. Start the backend (BACKEND → npm run dev). The
          website keeps serving its offline copy meanwhile.
        </Card>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Projects"
            value={summary?.projects}
            icon="solar:notes-bold-duotone"
            color="primary"
            href={paths.dashboard.portfolio.projects}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Experiences"
            value={summary?.experiences}
            icon="solar:case-minimalistic-bold"
            color="info"
            href={paths.dashboard.portfolio.experience}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Skills"
            value={summary?.skills}
            icon="solar:atom-bold-duotone"
            color="warning"
            href={paths.dashboard.portfolio.skills}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Unread messages"
            value={summary?.unread}
            icon="solar:letter-unread-bold"
            color="error"
            href={paths.dashboard.portfolio.messages}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: 1 }}>
            <CardHeader
              title="Latest messages"
              action={
                <Button
                  component={RouterLink}
                  href={paths.dashboard.portfolio.messages}
                  size="small"
                >
                  View all
                </Button>
              }
              sx={{ mb: 2 }}
            />
            <Divider />
            {(messages ?? []).slice(0, 5).map((m) => (
              <Box
                key={m.id}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderBottom: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Typography variant="subtitle2" noWrap>
                    {!m.read && (
                      <Label color="info" sx={{ mr: 1 }}>
                        New
                      </Label>
                    )}
                    {m.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', flexShrink: 0 }}>
                    {fToNow(m.createdAt)}
                  </Typography>
                </Box>
                <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
                  {m.message}
                </Typography>
              </Box>
            ))}
            {messages?.length === 0 && (
              <Typography sx={{ p: 3, color: 'text.secondary' }}>No messages yet.</Typography>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3}>
            <Card>
              <CardHeader title="Sections on the website" sx={{ mb: 2 }} />
              <Divider />
              <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(sections ?? []).map((s) => (
                  <Label
                    key={s.key}
                    color={s.visible ? 'success' : 'default'}
                    startIcon={
                      <Iconify icon={s.visible ? 'eva:checkmark-fill' : 'mingcute:close-line'} />
                    }
                  >
                    {SECTION_LABELS[s.key]}
                  </Label>
                ))}
              </Box>
            </Card>

            <Card>
              <CardHeader title="Shortcuts" sx={{ mb: 2 }} />
              <Divider />
              <Box sx={{ p: 2, display: 'grid', gap: 1.5, gridTemplateColumns: '1fr 1fr' }}>
                {shortcuts.map((s) => (
                  <Button
                    key={s.label}
                    component={RouterLink}
                    href={s.href}
                    variant="soft"
                    startIcon={<Iconify icon={s.icon} />}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    {s.label}
                  </Button>
                ))}
              </Box>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
