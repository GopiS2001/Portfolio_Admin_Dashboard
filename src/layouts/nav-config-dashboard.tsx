import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  dashboard: icon('ic-dashboard'),
  home: icon('ic-banking'),
  about: icon('ic-user'),
  skills: icon('ic-course'),
  experience: icon('ic-job'),
  projects: icon('ic-folder'),
  contact: icon('ic-chat'),
  mail: icon('ic-mail'),
  configuration: icon('ic-params'),
  lock: icon('ic-lock'),
};

// ----------------------------------------------------------------------

export const navData: NavSectionProps['data'] = [
  {
    subheader: 'Overview',
    items: [{ title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard }],
  },
  {
    subheader: 'Website content',
    items: [
      { title: 'Home', path: paths.dashboard.portfolio.home, icon: ICONS.home },
      { title: 'About', path: paths.dashboard.portfolio.about, icon: ICONS.about },
      { title: 'Skills', path: paths.dashboard.portfolio.skills, icon: ICONS.skills },
      { title: 'Experience', path: paths.dashboard.portfolio.experience, icon: ICONS.experience },
      { title: 'Projects', path: paths.dashboard.portfolio.projects, icon: ICONS.projects },
      { title: 'Contact', path: paths.dashboard.portfolio.contact, icon: ICONS.contact },
    ],
  },
  {
    subheader: 'Manage',
    items: [
      { title: 'Messages', path: paths.dashboard.portfolio.messages, icon: ICONS.mail },
      {
        title: 'Configuration',
        path: paths.dashboard.portfolio.configuration,
        icon: ICONS.configuration,
      },
      { title: 'Account', path: paths.dashboard.portfolio.account, icon: ICONS.lock },
    ],
  },
];
