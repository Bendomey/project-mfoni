import {RadioGroup} from '@headlessui/react'
import {classNames} from '@/lib/classNames.ts'

const visibilityOptions = ['PUBLIC', 'PRIVATE']

interface Props {
  visibility?: IContentVisibility
  setVisibility: (visibility: IContentVisibility) => void
}

export function VisibilityPicker({
  visibility = 'PUBLIC',
  setVisibility,
}: Props) {
  return (
    <div>
      <div className="">
        <label
          htmlFor="email"
          className="block font-semibold text-lg leading-6 text-gray-500"
        >
          Visibility
        </label>
        <small>Determine how users can view your content.</small>
      </div>

      <RadioGroup value={visibility} onChange={setVisibility} className="mt-2">
        <RadioGroup.Label className="sr-only">
          Choose a visibility option
        </RadioGroup.Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 ">
          {visibilityOptions.map(option => (
            <RadioGroup.Option
              key={option}
              value={option}
              className={({active, checked}) =>
                classNames(
                  'cursor-pointer focus:outline-none',
                  active ? 'ring-2 ring-blue-600 ring-offset-2' : '',
                  checked
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : 'ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50',
                  'flex items-center justify-center rounded-md py-3 px-3 text-sm font-bold uppercase sm:flex-1',
                )
              }
            >
              <RadioGroup.Label as="span">{option}</RadioGroup.Label>
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}
