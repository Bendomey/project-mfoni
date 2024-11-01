import Confetti from 'react-confetti'
import {Button} from '@/components/button/index.tsx'
import {useSearchParams} from '@remix-run/react'

export const WelcomeStep = () => {
  const [searchParams] = useSearchParams()
  return (
    <>
      {/** @ts-expect-error - Confetti default export errors. */}
      <Confetti className="h-full w-full" />
      <div className="text-7xl mb-16">🚀</div>
      <h1 className="text-2xl font-extrabold mb-2">
        You&apos;re now a verified user!
      </h1>
      <p>
        Your account is secured more than ever. You can now explore the app and
        enjoy the full experience.
      </p>

      <div className="mt-5">
        <Button isLink href={searchParams.get('return_to') ?? '/'} size="lg">
          Explore App
        </Button>
      </div>
    </>
  )
}
