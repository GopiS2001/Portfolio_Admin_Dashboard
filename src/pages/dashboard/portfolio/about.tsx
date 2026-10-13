import { CONFIG } from 'src/global-config';
import { AboutContentView } from 'src/portfolio/views/content-views';

// ----------------------------------------------------------------------

const metadata = { title: `About | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <AboutContentView />
    </>
  );
}
