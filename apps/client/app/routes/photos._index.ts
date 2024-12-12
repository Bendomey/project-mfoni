import { redirect } from '@remix-run/node'
import { PAGES } from '@/constants/index.ts'

// This is a 404 page. but because it's a search page, we redirect to the home page
export async function loader() {
	return redirect(PAGES.HOME)
}
