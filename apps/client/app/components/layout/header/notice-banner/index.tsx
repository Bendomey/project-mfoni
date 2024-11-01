import {useGetActiveCreatorApplication} from '@/api/creator-applications/index.ts'
import {Button} from '@/components/button/index.tsx'
import {useAuth} from '@/providers/auth/index.tsx'
import {useMemo} from 'react'

export function NoticeBanner() {
  const {isLoggedIn, currentUser} = useAuth()
  const {data: activeCreatorApplcation} = useGetActiveCreatorApplication({
    enabled: isLoggedIn,
  })

  const {showHeader, continueCreatorApplication, verifyAccount} =
    useMemo(() => {
      if (currentUser) {
        if (
          !currentUser.phoneNumberVerifiedAt ||
          !currentUser.emailVerifiedAt
        ) {
          return {
            showHeader: true,
            verifyAccount: true,
          }
        }
      }

      if (activeCreatorApplcation) {
        if (activeCreatorApplcation.status === 'PENDING') {
          return {
            showHeader: true,
            continueCreatorApplication: true,
          }
        }
      }

      return {
        showHeader: false,
      }
    }, [activeCreatorApplcation, currentUser])

  if (!showHeader) return null

  let content: JSX.Element | null = null

  if (verifyAccount) {
    content = (
      <>
        <p className="text-sm leading-6 text-gray-900">
          <strong className="font-semibold">Mfoni Notifications</strong>
          <svg
            viewBox="0 0 2 2"
            aria-hidden="true"
            className="mx-2 inline h-0.5 w-0.5 fill-current"
          >
            <circle r={1} cx={1} cy={1} />
          </svg>
          Verifying your account will help us secure your account.
        </p>
        <Button
          isLink={true}
          href="/account/verify"
          className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          Continue <span aria-hidden="true">&rarr;</span>
        </Button>
      </>
    )
  } else if (continueCreatorApplication) {
    content = (
      <>
        <p className="text-sm leading-6 text-gray-900">
          <strong className="font-semibold">Mfoni Notifications</strong>
          <svg
            viewBox="0 0 2 2"
            aria-hidden="true"
            className="mx-2 inline h-0.5 w-0.5 fill-current"
          >
            <circle r={1} cx={1} cy={1} />
          </svg>
          You have a creator application in progress.
        </p>
        <Button
          isLink={true}
          href="/account?complete-creator-application=true"
          color="black"
          size="sm"
          className="rounded-full"
        >
          Continue <span aria-hidden="true">&rarr;</span>
        </Button>
      </>
    )
  }

  return (
    <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-gray-50 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      <div
        aria-hidden="true"
        className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
      >
        <div
          style={{
            clipPath:
              'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
          }}
          className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-30"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
      >
        <div
          style={{
            clipPath:
              'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
          }}
          className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-30"
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {content}
      </div>
      <div className="flex flex-1 justify-end" />
    </div>
  )
}
