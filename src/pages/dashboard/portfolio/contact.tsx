import { CONFIG } from 'src/global-config';
import { ContactContentView } from 'src/portfolio/views/content-views';

// ----------------------------------------------------------------------

const metadata = { title: `Contact | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <ContactContentView />
    </>
  );
}
