import {Button} from '@/components/button/index.tsx'
import {Fragment, useState} from 'react'
import {Transition, Dialog} from '@headlessui/react'
import {XMarkIcon} from '@heroicons/react/24/solid'
import {TextSearch} from '../search/text/index.tsx'
import {
  MagnifyingGlassIcon,
  ViewfinderCircleIcon,
} from '@heroicons/react/24/outline'
import {VisualSearch} from '../search/visual/index.tsx'

interface Props {
  onClose: VoidFunction
}

const MENUS = {
  TEXT_SEARCH: 'TEXT_SEARCH',
  VISUAL_SEARCH: 'VISUAL_SEARCH',
}

const SearchModal = ({onClose}: Props) => {
  const [activeMenu, setActiveMenu] = useState(MENUS.TEXT_SEARCH)

  return (
    <div className=" py-2">
      <div className="flex flex-row items-center justify-between px-3">
        <div />
        <div>
          <div className="flex flex-row items-center rounded-lg bg-zinc-100">
            <Button
              onClick={() => setActiveMenu(MENUS.TEXT_SEARCH)}
              variant="unstyled"
              externalClassName={`p-4 ${
                activeMenu === MENUS.TEXT_SEARCH
                  ? 'bg-zinc-300 rounded-l-lg'
                  : ''
              } `}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => setActiveMenu(MENUS.VISUAL_SEARCH)}
              variant="unstyled"
              externalClassName={`p-4 ${
                activeMenu === MENUS.VISUAL_SEARCH
                  ? 'bg-zinc-300 rounded-r-lg'
                  : ''
              } `}
            >
              <ViewfinderCircleIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <Button onClick={onClose} variant="unstyled">
          <XMarkIcon className="h-7 w-7 text-zinc-600" />
        </Button>
      </div>

      {activeMenu === MENUS.TEXT_SEARCH ? (
        <>
          <div className="mt-5">
            <input
              type="text"
              className="w-full focus:ring-0 bg-zinc-100 rounded-md border-none placeholder:text-gray-500 text-gray-900 py-3"
              placeholder="Search for photos"
            />
          </div>
          <div className="h-[58vh] overflow-y-scroll -mx-2 px-2 mt-5">
            <TextSearch />
          </div>
        </>
      ) : null}

      {activeMenu === MENUS.VISUAL_SEARCH ? <VisualSearch /> : null}
    </div>
  )
}

export const SearchPhotosForMobile = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  return (
    <>
      <div className="flex md:hidden">
        <Button
          variant="unstyled"
          onClick={() => setIsSearchFocused(true)}
          externalClassName="block w-full rounded-full text-base flex flex-start items-center font-medium py-2 px-5 text-gray-400 bg-white border border-zinc-400"
        >
          <MagnifyingGlassIcon className="h-5 w-5 mr-3 text-zinc-400" />
          Search for photos
        </Button>
      </div>
      <Transition show={isSearchFocused} as={Fragment}>
        <Dialog onClose={() => setIsSearchFocused(false)} className="">
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <div className="absolute bottom-0 p-2 z-50 mt-2 w-screen h-[80vh] overflow-hidden rounded-lg bg-white shadow-lg border border-zinc-200 rounded-t-xl ring-1 ring-gray-900/5">
              <SearchModal onClose={() => setIsSearchFocused(false)} />
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  )
}
