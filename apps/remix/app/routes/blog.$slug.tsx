import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return json({ slug: params.slug });
};

export default function BlogPage() {
  const { slug } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Blog</h1>
      <p>We don&apos;t talk about {slug}</p>
      <br />
      <Link to="/">Back</Link>
    </div>
  );
}
