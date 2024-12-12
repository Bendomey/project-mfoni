import {
	redirect,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { CreatorPage } from '@/modules/index.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Domey Benjamin | mfoni' },
		{ name: 'description', content: "Benjamin's mfoni profile" },
	]
}

export function loader({ params }: LoaderFunctionArgs) {
	const { username } = params

	if (username && !username.startsWith('@')) {
		return redirect(`/@${username}`)
	}
	return null
}

export default CreatorPage
