import { CheckBadgeIcon } from '@heroicons/react/24/outline'
import { useMemo, useState } from 'react'

import './pin-code.css'
import { SendOtp } from './send.tsx'
import { VerifyOtp } from './verify.tsx'

type IPage = 'SendOTP' | 'VerifyOTP'

const screens = {
	SendOTP: SendOtp,
	VerifyOTP: VerifyOtp,
}

export const VerifyPhoneStep = () => {
	const [page, setPage] = useState<IPage>('SendOTP')

	const Page = useMemo(() => screens[page], [page])

	return (
		<div className="flex flex-col items-center">
			<CheckBadgeIcon className="mb-5 h-20 w-auto text-zinc-400" />
			<h1 className="text-3xl font-bold">Verify your phone</h1>
			<Page setPage={setPage} />
		</div>
	)
}
