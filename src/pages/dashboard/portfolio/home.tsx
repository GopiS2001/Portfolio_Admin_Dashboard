import { CONFIG } from 'src/global-config';
import { HomeContentView } from 'src/portfolio/views/content-views';

// ----------------------------------------------------------------------

const metadata = { title: `Home | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <HomeContentView />
    </>
  );
}
