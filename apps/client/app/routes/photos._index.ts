import {PAGES} from '@/constants/index.ts'
import {redirect} from '@remix-run/node'

export async function loader() {
  return redirect(PAGES.HOME)
}
