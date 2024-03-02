import { useGenerateSmileIdToken } from '@/api/users/index.ts';
import { Button } from '@/components/button/index.tsx'
import { Loader } from '@/components/loader/index.tsx';
import { APP_NAME, APP_WEBSITE } from '@/constants/index.ts';
import { useAuth } from '@/providers/auth/index.tsx';
import {
  CreditCardIcon,
} from '@heroicons/react/24/outline'
import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import { toast } from 'react-hot-toast'

declare global {
  interface Window {
    // TODO: type it later.
    SmileIdentity?: any
  }
}

export const VerifyIdStep = () => {
  const loader = useLoaderData<{
    SMILEID_ENVIRONMENT: string
    SMILEID_PARTNER_ID: string
    API_ADDRESS: string
  }>()
  const { currentUser } = useAuth()
  const { mutate, isPending } = useGenerateSmileIdToken()
  const [initiateSmileId, setInitiateSmileId] = useState(false)

  const isLoading = isPending || initiateSmileId

  const onInitiate = () => {
    if (currentUser?.id) {
      
      mutate(currentUser.id, {
        onSuccess: (data) => {
          setInitiateSmileId(true)
          
          window.SmileIdentity({
            token: data.token,
            product: data.product,
            callback_url: `${loader.API_ADDRESS}/api/v1/users/smileid/verify/${data.jobId}/${currentUser.id}`,
            environment: loader.SMILEID_ENVIRONMENT,
            partner_details: {
              partner_id: loader.SMILEID_PARTNER_ID,
              name: APP_NAME,
              logo_url: 'https://www.mylespudo.com/_next/static/media/AppLogo.d97e3b3a.png', // TODO: change to the actual logo
              policy_url: `${APP_WEBSITE}/policy`,
              theme_color: '#1C4ED8'
            },
            onSuccess: () => {
              setInitiateSmileId(false)
            },
            onClose: () => {
              setInitiateSmileId(false)
            },
            onError: () => {
              // TODO: make a sentry call and then triage.
              setInitiateSmileId(false)
              toast.error("Oops, Something happened verifying ID. Please try again.")}
          });
        },
        onError: (e) => {
          console.error(e)
          // TODO: make a sentry call and then triage.
          toast.error("Something happened initiating verified. Please try again.")
        }
      })
    }
  }

  return (
    <div className="flex flex-col items-center ">
      <CreditCardIcon className="h-20 w-auto text-zinc-400 mb-5" />
      <h1 className="text-3xl font-bold">Verify your ID</h1>

      {isLoading ? (
        <div className="mt-10 flex justify-center items-center">
          <Loader color="fill-blue-600" />
        </div>
      ) : (
        <Button type="button" onClick={onInitiate} externalClassName="w-full mt-5" size="lg">
          Initiate Verification
        </Button>
      )}
    </div>
  )
}
