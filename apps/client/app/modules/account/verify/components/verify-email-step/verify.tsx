import { useEffect, useState } from 'react'
import { PinField } from 'react-pin-field'
import { useVerifyCreator } from '../../context.tsx'
import { useUpdateEmail, useVerifyEmail } from '@/api/users/index.ts'
import { Button } from '@/components/button/index.tsx'
import { Loader } from '@/components/loader/index.tsx'
import { errorMessagesWrapper } from '@/constants/error-messages.ts'
import { errorToast, successToast } from '@/lib/custom-toast-functions.tsx'
import { useAuth } from '@/providers/auth/index.tsx'

interface Props {
	setPage: React.Dispatch<React.SetStateAction<'SendOTP' | 'VerifyOTP'>>
}

export const VerifyOtp = ({ setPage }: Props) => {
	const { setActiveStep } = useVerifyCreator()
	const [countDown, setCountdown] = useState(59)
	const [code, setCode] = useState('')
	const { currentUser, onUpdateUser } = useAuth()
	const { mutate: verifyEmail, isPending: isVerifying } = useVerifyEmail()
	const { mutate: resendCode, isPending: isResending } = useUpdateEmail()

	const verifyCode = () => {
		verifyEmail(
			{
				verificationCode: code,
			},
			{
				onSuccess() {
					if (currentUser) {
						onUpdateUser({
							...currentUser,
							emailVerifiedAt: new Date(),
						})
					}
					successToast('Email Address verified successfully', {
						id: 'email-verified',
					})
					setActiveStep('welcome')
				},
				onError(error) {
					if (error.message) {
						errorToast(errorMessagesWrapper(error.message), {
							id: 'email-verify-error',
						})
					}
				},
			},
		)
	}

	const resendCodeHandler = () => {
		if (currentUser?.email) {
			resendCode(
				{
					emailAddress: currentUser.email,
				},
				{
					onSuccess() {
						setCountdown(59)
						successToast('Verification code sent successfully', {
							id: 'email-resend-successful',
						})
					},
					onError(error) {
						if (error.message) {
							errorToast(errorMessagesWrapper(error.message), {
								id: 'email-resend-error',
							})
						}
					},
				},
			)
		}
	}

	useEffect(() => {
		let timer: any
		if (countDown > 0) {
			timer = setTimeout(() => setCountdown(countDown - 1), 1000)
		}
		return () => clearTimeout(timer)
	}, [countDown])

	return (
		<>
			<div className="mt-4 flex flex-row items-end">
				<p className="text-zinc-600">
					We sent a code to{' '}
					<span className="font-bold">{currentUser?.email ?? 'N/A'}</span>
				</p>
				<button
					type="button"
					onClick={() => setPage('SendOTP')}
					className="ml-1 text-xs text-blue-600"
				>
					Change
				</button>
			</div>

			<div className="mt-10">
				<PinField
					length={5}
					validate={/^[0-9]$/}
					className="pin-field"
					onChange={setCode}
					autoFocus
					disabled={isVerifying}
				/>
			</div>

			{isVerifying ? (
				<div className="mt-10">
					<Loader color="fill-blue-600" />
				</div>
			) : (
				<>
					<Button
						onClick={verifyCode}
						className="mt-10 w-full justify-center lg:w-1/3"
						size="lg"
					>
						Verify
					</Button>
					<div className="mt-4 flex flex-row items-center">
						<span className="text-gray-500">
							Didn&apos;t receive a verification code?
						</span>
						{countDown === 0 ? (
							<button
								type="button"
								onClick={resendCodeHandler}
								disabled={isResending}
								className="ml-2 text-blue-600"
							>
								{isResending ? 'resending...' : 'resend'}
							</button>
						) : (
							<span className="ml-2 text-blue-600">
								0:{countDown < 10 ? `0${countDown}` : countDown}
							</span>
						)}
					</div>
				</>
			)}
		</>
	)
}
