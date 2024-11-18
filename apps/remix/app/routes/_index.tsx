import { Form, json, Link, useActionData } from '@remix-run/react';
import { track } from '@vercel/analytics/server';

export const action = async () => {
  await track('Server Action', { some: 'data' });
  return json({ success: true });
};

export default function Home() {
  const data = useActionData<typeof action>();
  return (
    <main>
      <h1>Vercel Web Analytics Demo</h1>
      {data?.success ? (
        <p>Success!</p>
      ) : (
        <Form method="POST" replace>
          <button type="submit">Submit action</button>
        </Form>
      )}
      <Link to="/blog/henri">About Henri</Link>
      <br />
      <Link to="/blog/bruno">About Bruno</Link>
    </main>
  );
}
