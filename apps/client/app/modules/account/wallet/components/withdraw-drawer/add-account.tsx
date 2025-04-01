import { CreditCardIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { useCreateTransferRecipient } from "@/api/transfers/index.ts";
import { Button } from "@/components/button/index.tsx";
import { Loader } from "@/components/loader/index.tsx";
import { ErrorLottie } from "@/components/lotties/error.tsx";
import { Modal } from "@/components/modal/index.tsx";
import { QUERY_KEYS } from "@/constants/index.ts";
import { useDisclosure } from "@/hooks/use-disclosure.tsx";
import { useGetPaystackBanks } from "@/hooks/use-get-paystack-banks.ts";
import { useVerifyPaystackBank } from "@/hooks/use-verify-paystack-bank.ts";
import { classNames } from "@/lib/classNames.ts";
import { errorToast, successToast } from "@/lib/custom-toast-functions.tsx";

interface Inputs {
    bankCode: string;
    accountNumber: string;
}

const schema = Yup.object().shape({
    bankCode: Yup.string()
        .required("Bank is required."),
    accountNumber: Yup.string()
        .required("Account Number is required.")
});

interface Props {
    navigate: (tab: string) => void;
}

export function AddNewAccount({ navigate }: Props) {
    const verifyModalState = useDisclosure()
    const queryClient = useQueryClient()
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset
    } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });
    const { isLoading, data, error, fetch } = useGetPaystackBanks()
    const { data: accountDetails, isError: isErrorVerifying, mutate, isLoading: isSubmitting } = useVerifyPaystackBank()
    const { mutate: createRecipient, isPending: isCreatingRecipient } = useCreateTransferRecipient()

    useEffect(() => {
        if (isErrorVerifying) {
            errorToast("Account is invalid", {
                id: "invalid-account"
            })
        }
    }, [isErrorVerifying])

    useEffect(() => {
        if (accountDetails) {
            verifyModalState.onOpen()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountDetails])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center mt-10">
                <Loader />
            </div>
        )
    }

    if (error) {
        return <ErrorState retry={fetch} />
    }

    const isSubmitButtonDisabled = !watch('bankCode') || !watch('accountNumber') || isSubmitting

    const onRecipientCreate = () => {
        const bank = data?.find((bank) => bank.code === watch('bankCode'))
        if (!bank) return
        if (!accountDetails) return

        createRecipient({
            accountName: accountDetails?.account_name,
            accountNumber: watch('accountNumber'),
            bankCode: watch('bankCode'),
            bankName: bank?.name,
            type: bank?.type
        }, {
            onSuccess() {
                queryClient.invalidateQueries({
                    queryKey: [QUERY_KEYS.TRANSFER_RECIPIENTS]
                })
                successToast("Account added successfully", {
                    id: "add-account-success"
                })
                verifyModalState.onClose()
                navigate('ACCOUNTS')
                reset()

            },
            onError() {
                errorToast("An error occurred while adding the account", {
                    id: "add-account-error"
                })
            }
        })
    }

    return (
        <form onSubmit={handleSubmit(mutate)} className="m-5 space-y-5">
            <div>
                <label htmlFor="bank" className="block text-sm/6 font-medium text-gray-900">
                    Bank *
                </label>
                <p className="text-xs text-gray-400 mt-1">We only list banks/mobile operators in Ghana</p>
                <div className="mt-1 grid grid-cols-1">
                    <select
                        aria-invalid={errors.bankCode ? "true" : "false"}
                        aria-describedby={errors.bankCode ? "bank-error" : undefined}
                        {...register("bankCode")}
                        className={
                            classNames(
                                "col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-blue-600 sm:text-sm/6",
                                {
                                    "text-red-900 outline-red-300 placeholder:text-red-300 focus:outline-red-600":
                                        errors.bankCode,
                                },
                            )
                        }
                    >
                        <option value=''>Please select</option>
                        {
                            data?.map((bank) => (
                                <option key={bank.code} value={bank.code}>{bank.name}</option>
                            ))
                        }
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="account_number" className="block text-sm/6 font-medium text-gray-900">
                    Account Number *
                </label>
                <div className="mt-1 grid grid-cols-1">
                    <input
                        placeholder="eg. 0241234567"
                        type="text"
                        autoComplete="account_number"
                        aria-invalid={errors.accountNumber ? "true" : "false"}
                        aria-describedby={
                            errors.accountNumber ? "account_number-error" : undefined
                        }
                        {...register("accountNumber")}
                        className="col-start-1 row-start-1 w-full placeholder:text-gray-400 appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-blue-600 sm:text-sm/6"
                    />
                </div>
            </div>
            <div className="space-x-3 flex justify-end">
                <Button variant='outlined'>Cancel</Button>
                <Button disabled={isSubmitButtonDisabled} type='submit'>{isSubmitting ? 'Verifying...' : 'Verify Account'}</Button>
            </div>
            <AccountDetails onSubmit={onRecipientCreate} bankCode={watch('bankCode')} isOpened={verifyModalState.isOpened} onClose={verifyModalState.onClose} accountDetails={accountDetails} isLoading={isCreatingRecipient} />
        </form>
    )
}


function ErrorState({ retry }: { retry: () => void }) {
    return (
        <div className="py-20 text-center">
            <ErrorLottie />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 ">
                Error fetching banks.
            </h3>
            <p className="mt-1 px-10 text-sm text-gray-500">
                An error occurred while fetching banks.
            </p>
            <div className="mt-4">
                <Button onClick={retry} size="sm">
                    Retry
                </Button>
            </div>
        </div>
    );
}

interface AccountDetailsProps {
    isOpened: boolean;
    onClose: () => void;
    accountDetails?: PaystackBankVerify
    bankCode: string
    onSubmit: VoidFunction
    isLoading: boolean
}

function AccountDetails({ accountDetails, isOpened, onClose, onSubmit, isLoading, bankCode }: AccountDetailsProps) {

    return (
        <Modal isOpened={isOpened} onClose={onClose} canBeClosedWithBackdrop={false} className="w-full sm:w-1/2 lg:w-1/3">
            <div>
                <div className="flex items-start justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Account Details</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-blue-500"
                    >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon aria-hidden="true" className="size-6" />
                    </button>
                </div>
                <p className="text-gray-400 text-sm">Verify if the account details are accurate.</p>
                <div className="mt-5 bg-gray-50 p-5 flex items-center space-x-3">
                    <div>
                        {bankCode === "VOD" ? (
                            <img
                                alt="telecel logo"
                                src="/images/vodafone.png"
                                className="h-auto w-24"
                            />
                        ) : bankCode === "MTN" ? (
                            <img
                                alt="mtn logo"
                                src="/images/mtn_logo.png"
                                className="h-auto w-24"
                            />
                        ) : bankCode === "ATL" ? (
                            <img
                                alt="airtel tigo logo"
                                src="/images/airtel_tigo.png"
                                className="h-auto w-24"
                            />
                        ) : (
                            <CreditCardIcon className="size-8 text-gray-300" />
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mt-1">
                            {accountDetails?.account_name}
                        </p>
                        <p className="text-sm text-gray-500 font-bold mt-1">
                            {accountDetails?.account_number}
                        </p>
                    </div>
                </div>
                <div className="flex space-x-3 justify-end mt-5">
                    <Button disabled={isLoading} onClick={onSubmit}>Add Account</Button>
                    <Button variant='outlined' onClick={onClose}>Cancel</Button>
                </div>
            </div>
        </Modal>
    )
}