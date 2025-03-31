import { type ActionFunctionArgs } from "@remix-run/node";
import { environmentVariables } from "@/lib/actions/env.server.ts";
import { transport } from "@/lib/transport/index.ts";

export async function action({ request }: ActionFunctionArgs) {
  const PAYSTACK_SECRET_KEY = environmentVariables().PAYSTACK_SECRET_KEY;

  const formData = await request.formData();
  const type = formData.get("type");

  if (!type || ["mobile_money", "ghipss"].includes(type.toString())) {
    return { error: "Invalid request" };
  }

  const paystackURL = `https://api.paystack.co/bank?currency=GHS&type=${type.toString()}`;

  try {
    const response = await transport(paystackURL, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const json = (await response.json()) as {
      status: boolean;
      data: PaystackBank[];
    };

    if (json.status) {
      return { banks: json.data };
    }
  } catch {
    return { error: "No banks fetched" };
  }
}
