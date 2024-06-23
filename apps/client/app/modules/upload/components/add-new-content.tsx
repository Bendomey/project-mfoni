import {Button} from '@/components/button/index.tsx'
import {PlusIcon} from '@heroicons/react/24/outline'
import {useContentUpload} from '../context.tsx'

export const AddNewContentButton = () => {
  const {openFileSelector} = useContentUpload()
  return (
    <Button
      onClick={openFileSelector}
      variant="unstyled"
      externalClassName="bg-zinc-100 h-[12vh] w-[23vw] md:w-[7vw] mx-1 md:mx-5 flex justify-center items-center rounded-lg"
    >
      <PlusIcon className="h-7 text-zinc-500 w-auto" strokeWidth={4} />
    </Button>
  )
}
