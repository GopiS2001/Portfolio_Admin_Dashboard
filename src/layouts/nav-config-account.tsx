import type { AccountDrawerProps } from './components/account-drawer';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const _account: AccountDrawerProps['data'] = [
  { label: 'Home', href: '/', icon: <Iconify icon="solar:home-angle-bold-duotone" /> },
  {
    label: 'Configuration',
    href: paths.dashboard.portfolio.configuration,
    icon: <Iconify icon="solar:settings-bold-duotone" />,
  },
  {
    label: 'Account & password',
    href: paths.dashboard.portfolio.account,
    icon: <Iconify icon="solar:shield-keyhole-bold-duotone" />,
  },
];
