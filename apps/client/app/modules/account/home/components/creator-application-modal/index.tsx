import {Button} from '@/components/button/index.tsx'
import {Modal} from '@/components/modal/index.tsx'
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline'
import {useSearchParams} from '@remix-run/react'
import {SelectPackage} from './steps/select-package.tsx'
import {UploadDocuments} from './steps/upload-documents/index.tsx'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {
  useCreateCreatorApplication,
  useSubmitCreatorApplication,
  useUpdateCreatorApplication,
} from '@/api/creator-applications/index.ts'
import {useAccountContext} from '@/modules/account/home/context/index.tsx'
import {toast} from 'react-hot-toast'
import {errorMessagesWrapper} from '@/constants/error-messages.ts'
import {Loader} from '@/components/loader/index.tsx'

interface Props {
  isOpened: boolean
}

const steps = {
  package: SelectPackage,
  document: UploadDocuments,
}

export interface IImageType {
  url: string
  name: string
}

export function CreatorApplicationModal({isOpened}: Props) {
  const {activeCreatorApplication} = useAccountContext()
  const {
    mutateAsync: creatorCreatorApplication,
    isPending: isCreatingApplication,
  } = useCreateCreatorApplication()
  const {
    mutateAsync: updateCreatorApplication,
    isPending: isUpdatingApplication,
  } = useUpdateCreatorApplication()
  const {
    mutateAsync: submitCreatorApplication,
    isPending: isSubmitingApplication,
  } = useSubmitCreatorApplication()

  const [step, setStep] = useState<keyof typeof steps>('package')
  const [searchParams, setSearchParams] = useSearchParams()
  const [mfoniPackage, setMfoniPackage] = useState<string>('')
  const [idType, setIdType] = useState<string>('')
  const [frontId, setFrontId] = useState<IImageType>()
  const [backId, setBackId] = useState<IImageType>()

  useEffect(() => {
    if (activeCreatorApplication) {
      if (activeCreatorApplication.intendedPricingPackage) {
        setMfoniPackage(activeCreatorApplication.intendedPricingPackage)
        setStep('document')
      }
      setIdType(activeCreatorApplication.idType ?? '')
      setFrontId(
        activeCreatorApplication.idFrontImage
          ? {
              url: activeCreatorApplication.idFrontImage,
              name: 'front image',
            }
          : undefined,
      )
      setBackId(
        activeCreatorApplication.idBackImage
          ? {
              url: activeCreatorApplication.idBackImage,
              name: 'back image',
            }
          : undefined,
      )
    }
  }, [activeCreatorApplication])

  const onClose = useCallback(() => {
    searchParams.delete('complete-creator-application')
    setSearchParams(searchParams, {
      preventScrollReset: true,
    })
  }, [searchParams, setSearchParams])

  const isLoading = useMemo(
    () =>
      isCreatingApplication || isUpdatingApplication || isSubmitingApplication,
    [isCreatingApplication, isSubmitingApplication, isUpdatingApplication],
  )

  const isNextButtonDisabled = useMemo(() => !mfoniPackage, [mfoniPackage])
  const isCompleteButtonDisabled = useMemo(
    () => !mfoniPackage || !idType || !frontId || !backId || isLoading,
    [backId, frontId, idType, isLoading, mfoniPackage],
  )

  const handleSubmit = useCallback(async () => {
    try {
      if (!backId || !frontId) {
        return
      }
      let creatorApplicationId: string | undefined
      if (activeCreatorApplication) {
        creatorApplicationId = activeCreatorApplication.id
        await updateCreatorApplication({
          id: creatorApplicationId,
          idType,
          creatorPackageType: mfoniPackage,
          idBackImage: backId.url,
          idFrontImage: frontId.url,
        })
      } else {
        const newCreatorApplication = await creatorCreatorApplication({
          idType,
          creatorPackageType: mfoniPackage,
          idBackImage: backId.url,
          idFrontImage: frontId.url,
        })

        if (newCreatorApplication) {
          creatorApplicationId = newCreatorApplication.id
        }
      }

      if (!creatorApplicationId) {
        return toast.error('Creator Application is Required')
      }

      await submitCreatorApplication(creatorApplicationId)
      toast.success('Creator Application submitted.')

      window.location.href = '/account'
    } catch (error) {
      if (error instanceof Error) {
        toast.error(errorMessagesWrapper(error.message), {
          id: 'submit-creator-application',
        })
      }
    }
  }, [
    activeCreatorApplication,
    backId,
    creatorCreatorApplication,
    frontId,
    idType,
    mfoniPackage,
    submitCreatorApplication,
    updateCreatorApplication,
  ])

  return (
    <Modal
      className="w-full md:w-4/6 lg:w-3/6 p-0 relative"
      onClose={onClose}
      isOpened={isOpened}
      canBeClosedWithBackdrop={false}
    >
      <div className="flex flex-row items-center justify-between bg-gray-100 p-4 text-gray-600">
        <h1 className="font-bold ">Creator Application</h1>
      </div>
      <div className="m-4">
        {step === 'package' ? (
          <SelectPackage
            mfoniPackage={mfoniPackage}
            setMfoniPackage={setMfoniPackage}
          />
        ) : (
          <>
            <div className="flex flex-row items-center mb-2">
              <Button
                onClick={() => setStep('package')}
                variant="unstyled"
                className="font-bold text-sm"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" /> Back
              </Button>
            </div>
            <UploadDocuments
              idType={idType}
              setIdType={setIdType}
              frontId={frontId}
              setFrontId={setFrontId}
              backId={backId}
              setBackId={setBackId}
            />
          </>
        )}
      </div>
      <div className="mt-4 p-4 flex justify-end border-t gap-2">
        <Button
          variant="solid"
          type="button"
          color="secondaryGhost"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        {step === 'package' ? (
          <Button
            variant="solid"
            type="button"
            disabled={isNextButtonDisabled}
            onClick={() => setStep('document')}
          >
            Next <ArrowRightIcon className="ml-1 h-3 w-3" />
          </Button>
        ) : (
          <Button
            variant="solid"
            type="button"
            color="success"
            disabled={isCompleteButtonDisabled}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <Loader size="5" color="fill-white" />{' '}
                <span className="ml-2">Submitting</span>
              </>
            ) : (
              <>
                Complete <CheckIcon className="ml-1 h-3 w-3" />
              </>
            )}
          </Button>
        )}
      </div>
    </Modal>
  )
}
