import {Fragment, useState} from 'react'
import {Listbox, Transition} from '@headlessui/react'
import {CheckIcon, ChevronUpDownIcon} from '@heroicons/react/20/solid'
import {categories} from './web.tsx'
import {classNames} from '@/lib/classNames.ts'

export function MobileTabComponent() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0])

  return (
    <Listbox value={selectedCategory} onChange={setSelectedCategory}>
      {({open}) => (
        <>
          <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
            Categories
          </Listbox.Label>
          <div className="relative mt-2">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-3 pl-3 pr-10 text-left text-gray-900 shadow-none ring-1 ring-inset ring-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:text-sm sm:leading-6">
              <span className="flex items-center">
                {selectedCategory ? (
                  <selectedCategory.icon
                    className="h-5 w-5 shrink-0 text-gray-900  group-hover:text-gray-800"
                    aria-hidden="true"
                  />
                ) : null}

                <span className="ml-3 block truncate">
                  {selectedCategory?.name}
                </span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="bg-slate-900/20 backdrop-blur-sm fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer">
                <Listbox.Options className="absolute mx-24 z-10 max-h-64 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {categories.map(item => (
                    <Listbox.Option
                      key={item.name}
                      className={({active}) =>
                        classNames(
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600',
                          'relative cursor-default select-none py-2 pl-3 pr-9',
                        )
                      }
                      value={item}
                    >
                      {({selected, active}) => (
                        <>
                          <div className="flex items-center">
                            <item.icon
                              className={classNames(
                                selected
                                  ? 'text-gray-900'
                                  : 'text-gray-800 group-hover:text-gray-800',
                                'h-5 w-5 shrink-0',
                              )}
                              aria-hidden="true"
                            />
                            <span
                              className={classNames(
                                selected ? 'font-semibold' : 'font-normal',
                                'ml-3 block truncate',
                              )}
                            >
                              {item.name}
                            </span>
                          </div>

                          {selected ? (
                            <span
                              className={classNames(
                                active ? 'text-gray-600' : 'text-blue-600',
                                'absolute inset-y-0 right-0 flex items-center pr-4',
                              )}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}
