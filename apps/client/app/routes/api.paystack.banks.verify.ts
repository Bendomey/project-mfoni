import { type ActionFunctionArgs } from "@remix-run/node";
import { environmentVariables } from "@/lib/actions/env.server.ts";
import { transport } from "@/lib/transport/index.ts";

export async function action({ request }: ActionFunctionArgs) {
  const PAYSTACK_SECRET_KEY = environmentVariables().PAYSTACK_SECRET_KEY;

  const formData = await request.formData();
  const accountNumber = formData.get("accountNumber");
  const bankCode = formData.get("bankCode");

  if (!accountNumber || !bankCode) {
    return { error: "Invalid request" };
  }

  const paystackURL = `https://api.paystack.co/bank/resolve?account_number=${accountNumber.toString()}&bank_code=${bankCode.toString()}`;

  try {
    const response = await transport(paystackURL, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const json = (await response.json()) as {
      status: boolean;
      data: PaystackBankVerify;
    };

    if (json.status) {
      return { accountDetails: json.data };
    }
  } catch {
    return { error: "No account details fetched" };
  }
}
