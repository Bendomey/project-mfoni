import { Button } from '@/components/button/index.tsx'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useContentUpload } from '../context.tsx'
import { classNames } from '@/lib/classNames.ts'

export const AddNewContentButton = () => {
  const { openFileSelector, maxFiles } = useContentUpload()

  if (maxFiles === 0) return <div className='mt-10' />

  return (
    <Button
      onClick={openFileSelector}
      disabled={maxFiles === 0}
      variant="unstyled"
      className={
        classNames(
          "bg-zinc-100 hover:bg-zinc-200 h-[12vh] w-[23vw] md:w-[7vw] mx-1 md:mx-5 flex justify-center items-center rounded-lg",
        )
      }
    >
      <PlusIcon className="h-7 text-zinc-500 w-auto" strokeWidth={4} />
    </Button>
  )
}
