import { type ActionFunctionArgs } from "@remix-run/node";
import { makeSavedCardPrimary } from "@/api/saved-cards/index.ts";
import { errorMessagesWrapper } from "@/constants/error-messages.ts";
import { environmentVariables } from "@/lib/actions/env.server.ts";
import { extractAuthCookie } from "@/lib/actions/extract-auth-cookie.ts";

export async function action({ request }: ActionFunctionArgs) {
  const baseUrl = `${environmentVariables().API_ADDRESS}/api`;

  const formData = await request.formData();
  const savedCardId = formData.get("savedCardId");

  if (!savedCardId) {
    return { error: "Invalid request" };
  }

  const authCookie = await extractAuthCookie(request.headers.get("cookie"));

  try {
    await makeSavedCardPrimary(String(savedCardId), {
      authToken: authCookie ? authCookie.token : undefined,
      baseUrl,
    });

    return {
      success: true,
    };
  } catch (error) {
    let errorMessage = "Make card primary initiation failed. Try again!";

    if (error instanceof Error) {
      const newErrorResponse = errorMessagesWrapper(error.message);
      if (
        newErrorResponse !== "Something went wrong. Please try again later."
      ) {
        errorMessage = newErrorResponse;
      }
    }

    return { error: errorMessage };
  }
}
