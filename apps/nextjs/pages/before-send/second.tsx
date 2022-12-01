import { withAnalytics } from '../../components/withAnalytics';

function Page() {
  return (
    <div>
      <h1>Second Page</h1>
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
