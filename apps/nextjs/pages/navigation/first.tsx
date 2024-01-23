import Link from 'next/link';
import { withAnalytics } from '../../components/withAnalytics';

function Page() {
  return (
    <div>
      <h1>First Page</h1>
      <Link href="/navigation/second">Next</Link>
    </div>
  );
}

export default Page;
