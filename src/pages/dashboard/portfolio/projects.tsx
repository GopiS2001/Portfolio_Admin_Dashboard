import { CONFIG } from 'src/global-config';
import { ProjectsContentView } from 'src/portfolio/views/content-views';

// ----------------------------------------------------------------------

const metadata = { title: `Projects | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <ProjectsContentView />
    </>
  );
}
