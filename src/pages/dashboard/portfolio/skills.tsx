import { CONFIG } from 'src/global-config';
import { SkillsContentView } from 'src/portfolio/views/content-views';

// ----------------------------------------------------------------------

const metadata = { title: `Skills | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <SkillsContentView />
    </>
  );
}
