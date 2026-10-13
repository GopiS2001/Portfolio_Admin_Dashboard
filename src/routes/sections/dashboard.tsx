import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

const OverviewPage = lazy(() => import('src/pages/dashboard/portfolio/overview'));
const HomePage = lazy(() => import('src/pages/dashboard/portfolio/home'));
const AboutPage = lazy(() => import('src/pages/dashboard/portfolio/about'));
const SkillsPage = lazy(() => import('src/pages/dashboard/portfolio/skills'));
const ExperiencePage = lazy(() => import('src/pages/dashboard/portfolio/experience'));
const ProjectsPage = lazy(() => import('src/pages/dashboard/portfolio/projects'));
const ContactPage = lazy(() => import('src/pages/dashboard/portfolio/contact'));
const MessagesPage = lazy(() => import('src/pages/dashboard/portfolio/messages'));
const ConfigurationPage = lazy(() => import('src/pages/dashboard/portfolio/configuration'));
const AccountPage = lazy(() => import('src/pages/dashboard/portfolio/account'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

export const dashboardRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'home', element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'skills', element: <SkillsPage /> },
      { path: 'experience', element: <ExperiencePage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'configuration', element: <ConfigurationPage /> },
      { path: 'account', element: <AccountPage /> },
    ],
  },
];
