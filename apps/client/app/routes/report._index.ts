import { redirect } from '@remix-run/node'
import { PAGES } from '@/constants/index.ts'

// This is a 404 page. but because we only have on report page, we redirect to the report-contents page
export async function loader() {
	return redirect(PAGES.REPORT.CONTENTS)
}
