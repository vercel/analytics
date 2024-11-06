import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { track } from '@vercel/analytics';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return json({ slug: params.slug });
};

export default function BlogPage() {
  const { slug } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Blog</h1>
      <p>We don't talk about {slug}</p>
      <br />
      <Link to="/">Back</Link>
    </div>
  );
}
