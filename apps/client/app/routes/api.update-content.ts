import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { updateContent } from "@/api/contents/index.ts";
import { environmentVariables } from "@/lib/actions/env.server.ts";
import { extractAuthCookie } from "@/lib/actions/extract-auth-cookie.ts";

const baseUrl = `${environmentVariables().API_ADDRESS}/api`;

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const contentId = formData.get("contentId");
  const title = formData.get("title");
  const visibility = formData.get("visibility");
  const amount = formData.get("amount");

  if (!contentId) {
    return { error: "Invalid request" };
  }

  const authCookie = await extractAuthCookie(request.headers.get("cookie"));

  if (!authCookie) {
    const url = new URL(request.url);
    const returnTo = `${url.pathname}?${url.searchParams.toString()}`;
    return redirect(`/auth?return_to=${returnTo}`);
  }

  try {
    await updateContent(
      contentId as string,
      {
        amount: amount ? Number(amount) : undefined,
        title: title ? String(title) : undefined,
        visibility: visibility ? String(visibility) : undefined,
      },
      {
        authToken: authCookie.token,
        baseUrl,
      },
    );
  } catch (error: unknown) {
    return { error: "Update failed. Try again!" };
  }

  return { success: true };
}
