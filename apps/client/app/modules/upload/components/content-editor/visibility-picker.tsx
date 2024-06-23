import {useState} from 'react'
import {RadioGroup} from '@headlessui/react'
import {classNames} from '@/lib/classNames.ts'

const memoryOptions = [
  {name: 'PUBLIC', inStock: true},
  {name: 'PRIVATE', inStock: true},
]

export function VisibilityPicker() {
  const [mem, setMem] = useState(memoryOptions[0])

  return (
    <div>
      <div className="">
        <label
          htmlFor="email"
          className="block font-semibold text-lg leading-6 text-gray-500"
        >
          Visibility
        </label>
        <small>
          Users will still find it by visual search if it&apos;s private.
        </small>
      </div>

      <RadioGroup value={mem} onChange={setMem} className="mt-2">
        <RadioGroup.Label className="sr-only">
          Choose a memory option
        </RadioGroup.Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 ">
          {memoryOptions.map(option => (
            <RadioGroup.Option
              key={option.name}
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
              disabled={!option.inStock}
            >
              <RadioGroup.Label as="span">{option.name}</RadioGroup.Label>
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}
