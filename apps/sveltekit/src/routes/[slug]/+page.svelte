<script>
  import { page } from '$app/stores';
  import { track } from '@vercel/analytics/sveltekit';
</script>

<h1>We don't talk about {$page.params.slug}</h1>

<a href="/" onclick={() => track('go-back', { slug: $page.params.slug })}
  >Go back</a
>
