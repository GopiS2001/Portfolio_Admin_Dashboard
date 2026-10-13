import { CONFIG } from 'src/global-config';
import { OverviewView } from 'src/portfolio/views/overview-view';

// ----------------------------------------------------------------------

const metadata = { title: `Dashboard | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <OverviewView />
    </>
  );
}
