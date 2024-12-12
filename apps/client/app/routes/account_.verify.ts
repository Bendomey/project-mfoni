import {
	type MetaFunction,
	type LinksFunction,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { protectRouteLoader } from '@/lib/actions/protect-route-loader.ts'
import styles from '@/modules/account/verify/components/verify-phone-step/pin-code.css?url'
import { VerifyAccountModule } from '@/modules/index.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Verify Account | mfoni' },
		{ name: 'description', content: 'Welcome to mfoni!' },
		{ name: 'keywords', content: 'mfoni' },
	]
}

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }]

export async function loader(loaderArgs: LoaderFunctionArgs) {
	const res = await protectRouteLoader(loaderArgs)
	if (!res) {
		return {
			METRIC_CLIENT_ID: environmentVariables().METRIC_CLIENT_ID,
			METRIC_CLIENT_SECRET: environmentVariables().METRIC_CLIENT_SECRET,
		}
	}

	return res
}

export default VerifyAccountModule
