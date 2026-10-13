import { CONFIG } from 'src/global-config';
import { MessagesView } from 'src/portfolio/views/messages-view';

// ----------------------------------------------------------------------

const metadata = { title: `Messages | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <MessagesView />
    </>
  );
}
