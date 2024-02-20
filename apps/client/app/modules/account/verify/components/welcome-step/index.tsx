import Confetti from 'react-confetti'
import {Button} from '@/components/button/index.tsx'

export const WelcomeStep = () => {
  return (
    <>
      {/** @ts-expect-error - Confetti default export errors. */}
      <Confetti className="h-full w-full" />
      <div className="text-7xl mb-16">🚀</div>
      <h1 className="text-2xl font-extrabold mb-2">
        You&apos;re now a creator!
      </h1>
      <p>
        You&apos;ve successfully verified your account. You can now start
        uploading content.
      </p>

      <div className="mt-5">
        <Button isLink href="/" size="lg">
          Explore App
        </Button>
      </div>
    </>
  )
}
