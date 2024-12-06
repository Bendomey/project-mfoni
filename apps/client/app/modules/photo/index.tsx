import {Footer} from '@/components/footer/index.tsx'
import {Header} from '@/components/layout/index.ts'
import {ShareButton} from '@/components/share-button/index.tsx'
import {Button} from '@/components/button/index.tsx'

import {Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react'
import {ChevronDownIcon} from '@heroicons/react/20/solid'
import {
  BookmarkIcon,
  CalendarDaysIcon,
  HeartIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import {Link} from '@remix-run/react'
import {blurDataURL, PAGES} from '@/constants/index.ts'
import dayjs from 'dayjs'
import {imageUrls} from '../landing-page/index.tsx'
import {Image} from 'remix-image'
import {RelatedContent} from './components/related-content.tsx'

const tags = [
  'wallpaper',
  'nature',
  'background',
  'love',
  'business',
  'money',
  'office',
  'people',
]

export const PhotoModule = () => {
  return (
    <>
      <Header isHeroSearchInVisible={false} />
      <div className="mx-auto max-w-8xl py-4 px-4 lg:px-8">
        <div>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-blue-600">
                <span className="text-sm font-medium text-white">BD</span>
              </span>
              <div className="flex flex-col">
                <span className="font-medium ">Benjamin Domey</span>
                <span className="font-medium text-xs text-gray-500">
                  domeybenjamin
                </span>
              </div>
            </div>
            <div className="flex flex-row items-center  justify-between md:justify-normal gap-2">
              <div className="flex gap-2">
                <Button variant="outlined" size="sm">
                  <BookmarkIcon className="h-6 w-4 text-zinc-700 mr-1" />
                  Save
                </Button>
                <Button variant="outlined" size="sm">
                  <HeartIcon className="h-6 w-4 text-zinc-700 mr-1" />
                  Like
                </Button>
              </div>
              <DownloadButton />
            </div>
          </div>

          <div className="my-10 flex justify-center">
            <Image
              src={imageUrls[3]}
              alt={imageUrls[3]}
              className="object-cover"
              blurDataURL={blurDataURL}
              options={{
                fit: 'cover',
              }}
            />
          </div>

          <div className="flex flex-row items-start md:items-center justify-between">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-4 w-[50vw] md:w-full">
              <div className="text-sm">
                <h1 className="text-gray-500">Views</h1>
                <p className="font-semibold">1,000,000</p>
              </div>
              <div className="text-sm">
                <h1 className="text-gray-500">Downloads</h1>
                <p className="font-semibold">10</p>
              </div>
            </div>
            <div className="flex flex-row items-center gap-2">
              <ShareButton />
              <Button color="dangerGhost">Report</Button>
            </div>
          </div>

          <div className="mt-5">
            <h1 className="font-bold">Name of the image here</h1>

            <div className="mt-5">
              <div className="flex flex-row items-center gap-2 ">
                <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-500 font-medium">
                  Published on {dayjs().format('LL')}
                </span>
              </div>

              <div className="flex flex-row items-center gap-2 mt-2">
                <ShieldCheckIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-500 font-medium">
                  Free to use under the mfoni License
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center mt-10">
              {tags.map((tag, index) => (
                <Link key={index} to={PAGES.TAG.replace(':tag', tag)}>
                  <div className="bg-gray-100 px-3 py-2 rounded">
                    <span className="text-sm text-gray-600 font-medium">
                      {tag}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10">
          <RelatedContent />
        </div>
      </div>
      <Footer />
    </>
  )
}

const items = [
  {name: 'Small', size: '100 x 500', href: '#'},
  {name: 'Medium', size: '600 x 1200', href: '#'},
  {name: 'Large', size: '1000 x 5000', href: '#'},
]

export default function DownloadButton() {
  return (
    <div className="inline-flex rounded-md shadow-sm">
      <button
        type="button"
        className="relative inline-flex items-center rounded-l-md bg-green-600 text-white hover:bg-green-800 px-3 py-2 text-sm font-semibold focus:z-10"
      >
        Download
      </button>
      <Menu as="div" className="relative -ml-px block">
        <MenuButton className="relative inline-flex items-center rounded-r-md px-2 py-2 bg-green-600 text-white hover:bg-green-800 border-l border-gray-200 focus:z-10">
          <span className="sr-only">Open options</span>
          <ChevronDownIcon aria-hidden="true" className="size-5" />
        </MenuButton>
        <MenuItems
          transition
          className="absolute right-0 z-10 -mr-1 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
        >
          <div className="py-1">
            {items.map(item => (
              <MenuItem key={item.name}>
                <button className="w-full flex px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none">
                  {item.name}{' '}
                  <span className="text-gray-400 ml-1 text-xs">
                    ({item.size})
                  </span>
                </button>
              </MenuItem>
            ))}

            <MenuItem>
              <button className="w-full flex px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none">
                Original{' '}
                <span className="text-gray-400 ml-1 text-xs">
                  (1024 x 1024)
                </span>
              </button>
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
    </div>
  )
}
