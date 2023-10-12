import type { LoaderFunctionArgs } from "@remix-run/node";
import { track } from "@vercel/analytics/server";

export async function loader({ request }: LoaderFunctionArgs) {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

  await track("Health", { host });

  return new Response("OK");
}
