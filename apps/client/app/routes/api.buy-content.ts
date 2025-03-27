import { type ActionFunctionArgs } from "@remix-run/node";
import { buyContent } from "@/api/contents/index.ts";
import { errorMessagesWrapper } from "@/constants/error-messages.ts";
import { environmentVariables } from "@/lib/actions/env.server.ts";
import { extractAuthCookie } from "@/lib/actions/extract-auth-cookie.ts";

export async function action({ request }: ActionFunctionArgs) {
  const baseUrl = `${environmentVariables().API_ADDRESS}/api`;

  const formData = await request.formData();
  const contentId = formData.get("contentId");
  const paymentMethod = formData.get("paymentMethod");

  if (!contentId || !paymentMethod) {
    return { error: "Invalid request" };
  }

  const authCookie = await extractAuthCookie(request.headers.get("cookie"));

  try {
    const response = await buyContent(
      {
        contentId: contentId as string,
        paymentMethod: paymentMethod as ContentPurchase["type"],
      },
      {
        authToken: authCookie ? authCookie.token : undefined,
        baseUrl,
      },
    );

    if (response) {
      return {
        success: true,
        paymentMethod,
        accessCode: response.payment?.accessCode,
      };
    }
  } catch (error) {
    let errorMessage = "Buying image failed. Try again!";

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
