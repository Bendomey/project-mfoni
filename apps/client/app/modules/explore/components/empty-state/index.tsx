import {EmptyLottie} from '@/components/lotties/empty.tsx'

interface Props {
  title: string
  message: string
  svg?: any
}

export function EmptyState({message, title, svg}: Props) {
  return (
    <div className="text-center">
      {svg ? svg : <EmptyLottie />}
      <h3 className="mt-2 text-2xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      {/* <div className="mt-6">
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 size-5" />
          New Project
        </button>
      </div> */}
    </div>
  )
}
