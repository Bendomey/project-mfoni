import {TermsModule} from '@/modules/index.tsx'
import {type MetaFunction} from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    {title: 'Terms | mfoni'},
    {name: 'description', content: 'Welcome to mfoni!'},
    {name: 'keywords', content: 'mfoni, Mfoni'},
  ]
}

export default TermsModule
