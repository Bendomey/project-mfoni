import {type LoaderFunction} from '@remix-run/node'
import {sharpTransformer} from 'remix-image-sharp'
import {
  imageLoader,
  DiskCache,
  fsResolver,
  fetchResolver,
  type Resolver,
} from 'remix-image/server'

export const fetchImage: Resolver = async (asset, url, options, basePath) => {
  if (url.startsWith('/') && (url.length === 1 || url[1] !== '/')) {
    return fsResolver(asset, url, options, basePath)
  } else {
    return fetchResolver(asset, url, options, basePath)
  }
}

export const loader: LoaderFunction = ({request}) => {
  const config = {
    selfUrl: 'http://localhost:3000',
    cache: new DiskCache(),
    resolver: fetchImage,
    transformer: sharpTransformer,
    verbose: true
  }
  return imageLoader(config, request)
}
