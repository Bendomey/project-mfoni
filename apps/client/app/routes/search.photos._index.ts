import {redirect, type MetaFunction} from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    {title: 'Search | mfoni'},
    {
      name: 'description',
      content: 'Search for content on mfoni',
    },
    {name: 'keywords', content: 'mfoni, Mfoni'},
  ]
}

// This is a 404 page. but because it's a search page, we redirect to the home page
export const loader = () => {
  return redirect('/')
}
