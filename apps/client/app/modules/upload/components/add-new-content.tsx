import { PlusIcon } from '@heroicons/react/24/outline'
import { useContentUpload } from '../context.tsx'
import { Button } from '@/components/button/index.tsx'
import { classNames } from '@/lib/classNames.ts'

export const AddNewContentButton = () => {
	const { openFileSelector, maxFiles } = useContentUpload()

	if (maxFiles === 0) return <div className="mt-10" />

	return (
		<Button
			onClick={openFileSelector}
			disabled={maxFiles === 0}
			variant="unstyled"
			className={classNames(
				'mx-1 flex h-[12vh] w-[23vw] items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 md:mx-5 md:w-[7vw]',
			)}
		>
			<PlusIcon className="h-7 w-auto text-zinc-500" strokeWidth={4} />
		</Button>
	)
}
