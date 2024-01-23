export default function BlogPage({ params }: { params: { slug: string } }) {
  return (
    <div>
      <h2>{params.slug}</h2>
    </div>
  );
}
