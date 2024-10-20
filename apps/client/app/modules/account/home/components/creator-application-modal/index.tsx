import { Button } from "@/components/button/index.tsx";
import { Modal } from "@/components/modal/index.tsx";
import { ArrowRightIcon, CheckIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useSearchParams } from "@remix-run/react";
import { SelectPackage } from "./steps/select-package.tsx";
import { UploadDocuments } from "./steps/upload-documents.tsx";
import { useMemo, useState } from "react";

interface Props {
    isOpened: boolean;
}

const steps = {
    package: SelectPackage,
    document: UploadDocuments
}

export function CreatorApplicationModal({
    isOpened,
}: Props) {
    const [step, setStep] = useState<keyof typeof steps>('package')
    const [searchParams, setSearchParams] = useSearchParams()
    const [mfoniPackage, setMfoniPackage] = useState<string>('')
    const [idType, setIdType] = useState<string>('')
    const [frontId, setFrontId] = useState<string>('')
    const [backId, setBackId] = useState<string>('')

    const onClose = () => {
        searchParams.delete('complete-creator-application')
        setSearchParams(searchParams, {
            preventScrollReset: true,
        });
    }

    const isNextButtonDisabled = useMemo(() => !mfoniPackage, [mfoniPackage])
    const isCompleteButtonDisabled = useMemo(() => !idType || !frontId || !backId, [backId, frontId, idType])

    return (
        <Modal className='w-full md:w-4/6 lg:w-3/6 p-0' onClose={onClose} isOpened={isOpened} canBeClosedWithBackdrop={false}>
            <div className="flex flex-row items-center justify-between bg-gray-100 p-4 text-gray-600">
                <h1 className="font-bold ">Creator Application</h1>
                <Button variant='unstyled' onClick={onClose}>
                    <XMarkIcon className="h-5 w-5" />
                </Button>
            </div>
            <div className="m-4">
                {
                    step === 'package' ? (
                        <SelectPackage mfoniPackage={mfoniPackage} setMfoniPackage={setMfoniPackage} />
                    ) : (
                        <>
                            <div className="flex flex-row items-center mb-2">
                                <Button onClick={() => setStep('package')} variant='unstyled' className="font-bold text-sm">
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
                    )
                }
            </div>
            <div className="mt-4 p-4 flex justify-end border-t gap-2">
                <Button
                    variant="solid"
                    type="button"
                    color='secondaryGhost'
                    onClick={onClose}
                >
                    Cancel
                </Button>
                {
                    step === 'package' ? (
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
                            color='success'
                            disabled={isCompleteButtonDisabled}
                            onClick={() => setStep('document')}
                        >
                            Complete <CheckIcon className="ml-1 h-3 w-3" />
                        </Button>
                    )
                }

            </div>
        </Modal>
    );
}