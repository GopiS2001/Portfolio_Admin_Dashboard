import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

/** Bottom of the sidebar: signed-in admin + shortcut to the live website. */
export function NavUpgrade({ sx, ...other }: BoxProps) {
  const { user } = useAuthContext();

  return (
    <Box
      sx={[{ px: 2, py: 5, textAlign: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <Avatar alt={user?.displayName} sx={{ width: 48, height: 48 }}>
          {user?.displayName?.charAt(0).toUpperCase()}
        </Avatar>

        <Box sx={{ mb: 2, mt: 1.5, width: 1 }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ mb: 1, color: 'var(--layout-nav-text-primary-color)' }}
          >
            {user?.displayName}
          </Typography>

          <Typography
            variant="body2"
            noWrap
            sx={{ color: 'var(--layout-nav-text-disabled-color)' }}
          >
            {user?.email}
          </Typography>
        </Box>

        <Button
          variant="contained"
          href={CONFIG.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<Iconify icon="eva:external-link-fill" />}
        >
          View website
        </Button>
      </Box>
    </Box>
  );
}
