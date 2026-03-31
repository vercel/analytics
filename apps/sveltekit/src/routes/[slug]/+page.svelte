<script>
import { track } from '@vercel/analytics/sveltekit';
import { page } from '$app/stores';
</script>

<h1>We don't talk about {$page.params.slug}</h1>

<a href="/" onclick={() => track('go-back', { slug: $page.params.slug })}
  >Go back</a
>
