import { CONFIG } from 'src/global-config';
import { AccountView } from 'src/portfolio/views/account-view';

// ----------------------------------------------------------------------

const metadata = { title: `Account | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <AccountView />
    </>
  );
}
