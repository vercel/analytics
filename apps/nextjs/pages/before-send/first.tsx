import Link from 'next/link';
import { withAnalytics } from '../../components/withAnalytics';

function Page() {
  return (
    <div>
      <h1>First Page</h1>
      <Link href="/before-send/second?secret=vercel">Next</Link>
    </div>
  );
}

export default withAnalytics(Page, {
  beforeSend: (event) => {
    const url = new URL(event.url);
    if (url.searchParams.has('secret')) {
      url.searchParams.set('secret', 'REDACTED');
    }
    return {
      ...event,
      url: url.toString(),
    };
  },
});
