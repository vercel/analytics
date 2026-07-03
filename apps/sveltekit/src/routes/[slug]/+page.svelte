<script>
import { track } from '@vercel/analytics/sveltekit-next';
import { page } from '$app/state';
</script>

<h1>We don't talk about {page.params.slug}</h1>

<a href="/" onclick={() => track('go-back', { slug: page.params.slug })}
  >Go back</a
>
