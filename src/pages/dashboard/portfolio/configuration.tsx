import { CONFIG } from 'src/global-config';
import { ConfigurationView } from 'src/portfolio/views/configuration-view';

// ----------------------------------------------------------------------

const metadata = { title: `Configuration | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <ConfigurationView />
    </>
  );
}
