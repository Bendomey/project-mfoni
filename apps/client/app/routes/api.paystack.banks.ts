import { type ActionFunctionArgs } from '@remix-run/node'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { jsonWithCache } from '@/lib/actions/json-with-cache.server.ts'
import { transport } from '@/lib/transport/index.ts'

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
      return jsonWithCache({ accountDetails: json.data });
    }
  } catch {
    return { error: "No account details fetched" };
  }
}

export async function loader({ request }: ActionFunctionArgs) {
	const PAYSTACK_SECRET_KEY = environmentVariables().PAYSTACK_SECRET_KEY

	const url = new URL(request.url)
	const urlParams = new URLSearchParams(url.search)
	const type = urlParams.get('type')

	if (type && !['mobile_money', 'ghipss'].includes(type.toString())) {
		return { error: 'Invalid request' }
	}

	const searchParams = new URLSearchParams()
	searchParams.append('currency', 'GHS')

	if (type) {
		searchParams.append('type', type.toString())
	}

	try {
		const response = await transport(`https://api.paystack.co/bank?${searchParams.toString()}`, {
			headers: {
				Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
			},
		})

		const json = (await response.json()) as {
			status: boolean
			data: PaystackBank[]
		}

		if (json.status) {
			return jsonWithCache({ banks: json.data })
		}
	} catch {
		return { error: 'No banks fetched' }
	}
}
