import {RadioGroup} from '@headlessui/react'
import {CheckCircleIcon} from '@heroicons/react/20/solid'
import {classNames} from '@/lib/classNames.ts'

export type AccountTypeOption = {
  id: number
  title: string
  description: string
  value: User
}

const accountTypeList: AccountTypeOption[] = [
  {
    id: 1,
    title: 'Photographer/Creator',
    description: 'For photographers or content creator.',
    value: 'CREATOR',
  },
  {
    id: 2,
    title: 'Client',
    description: 'For users who are a client seeking services.',
    value: 'CLIENT',
  },
]

type Props = {
  selectedAccountType: AccountTypeOption | undefined
  setSelectedAccountType: React.Dispatch<
    React.SetStateAction<AccountTypeOption | undefined>
  >
}

export default function AccountType({
  selectedAccountType,
  setSelectedAccountType,
}: Props) {
  return (
    <RadioGroup value={selectedAccountType} onChange={setSelectedAccountType}>
      <RadioGroup.Label className="block text-sm font-medium leading-6 text-gray-900 mt-3">
        Select your user type
      </RadioGroup.Label>

      <div className="mt-2 grid grid-cols-1 gap-y-4 lg:gap-y-6 sm:grid-cols-2 sm:gap-x-4">
        {accountTypeList.map(mailingList => (
          <RadioGroup.Option
            key={mailingList.id}
            value={mailingList}
            className={({active}) =>
              classNames(
                active
                  ? 'border-blue-600 ring-2 ring-blue-600'
                  : 'border-gray-300',
                'relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-none focus:outline-none',
              )
            }
          >
            {({checked, active}) => (
              <>
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <RadioGroup.Label
                      as="span"
                      className="block text-sm font-medium text-gray-900"
                    >
                      {mailingList.title}
                    </RadioGroup.Label>
                    <RadioGroup.Description
                      as="span"
                      className="mt-1 flex items-center text-xs lg:text-sm text-gray-500"
                    >
                      {mailingList.description}
                    </RadioGroup.Description>
                    {/* <RadioGroup.Description
                      as="span"
                      className="mt-6 text-sm font-medium text-gray-900"
                    >
                      {mailingList.users}
                    </RadioGroup.Description> */}
                  </span>
                </span>
                <CheckCircleIcon
                  className={classNames(
                    Boolean(!checked) ? 'invisible' : '',
                    'h-5 w-5 text-blue-600',
                  )}
                  aria-hidden="true"
                />
                <span
                  className={classNames(
                    active ? 'border' : 'border-2',
                    checked ? 'border-blue-600' : 'border-transparent',
                    'pointer-events-none absolute -inset-px rounded-lg',
                  )}
                  aria-hidden="true"
                />
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
