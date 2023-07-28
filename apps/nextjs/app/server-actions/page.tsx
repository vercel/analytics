import { headers } from 'next/headers';
import { track } from '@vercel/analytics/server';

export default function FeedbackPage() {
  async function submitFeedback(data: FormData) {
    'use server';

    await track(
      'Feedback',
      {
        message: data.get('feedback') as string,
      },
      {
        // If we pass headers, the event will be connected to the page views/session
        headers: headers(),
      },
    );
  }

  return (
    <form action={submitFeedback}>
      <input type="text" name="feedback" placeholder="Feedback" />
      <button type="submit">Submit Feedback</button>
    </form>
  );
}
