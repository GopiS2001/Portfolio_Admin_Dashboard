import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

type Props = {
  heading: string;
  /** Anchor on the website to open with "Preview" (e.g. "projects"). */
  anchor?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

/** Standard page frame: breadcrumbs, a preview link to the website and stacked cards. */
export function PageShell({ heading, anchor, action, children }: Props) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={heading}
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: heading }]}
        action={
          <Stack direction="row" spacing={1}>
            {action}
            <Button
              variant="outlined"
              color="inherit"
              href={`${CONFIG.websiteUrl}${anchor ? `#${anchor}` : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<Iconify icon="solar:eye-bold" />}
            >
              Preview
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>{children}</Stack>
    </DashboardContent>
  );
}
