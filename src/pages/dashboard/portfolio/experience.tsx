import { CONFIG } from 'src/global-config';
import { ExperienceContentView } from 'src/portfolio/views/content-views';

// ----------------------------------------------------------------------

const metadata = { title: `Experience | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <ExperienceContentView />
    </>
  );
}
