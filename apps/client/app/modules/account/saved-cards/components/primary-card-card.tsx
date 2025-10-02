import { PlusIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { AddCardButton } from "./add-card/index.tsx";
import mastercardLogo from '@/assets/mastercard-icon.png'
import visaLogo from '@/assets/visa-icon.png'
import { Button } from "@/components/button/index.tsx";


interface Props {
    savedCard?: SavedCard
}

export function PrimaryCardCard({ savedCard }: Props) {
    if (!savedCard) {
        return (
            <AddCardButton>
                {({ onClick }) => (
                    <Button onClick={onClick} variant='unstyled' className='text-blue-600 font-semibold border-2 bg-white border-dashed p-4 rounded-md h-44 w-full flex justify-center items-center'>
                        <PlusIcon className="h-5 w-auto mr-2 inline" />
                        Add card
                    </Button>
                )}
            </AddCardButton>

        );
    }

    return (
        <div className="border  rounded-md bg-white">
            <div className="px-6 py-4 grid grid-cols-3 gap-2">
                <div>
                    {
                        savedCard.cardType.toLowerCase().trim() === 'visa' ? (
                            <img src={visaLogo} alt="Visa" className="h-auto w-auto" />
                        ) : savedCard.cardType.toLowerCase().trim() === 'mastercard' ? (
                            <img src={mastercardLogo} alt="Mastercard" className="h-auto w-auto" />
                        ) : (
                            <CreditCardIcon className="text-blue-800" />
                        )
                    }
                </div>
                <div className="col-span-2 mt-3">
                    <h1><span className="capitalize">{savedCard.cardType}</span> *****{savedCard.last4}</h1>
                    {savedCard.accountName ? <h2 className="text-xs text-gray-600">{savedCard.accountName}</h2> : null}
                    <p className="text-xs mt-2 text-gray-500">Expires {savedCard.expiryMonth}/{savedCard.expiryYear}</p>
                </div>
            </div>
            <div className="p-4 border-t flex flex-row items-center justify-between space-x-2">
                <div className="text-sm capitalize">{(savedCard.bank ?? "Primary").toLowerCase()}</div>
                <div>
                    <Button variant='solid' color='dangerGhost' size='sm' className='w-full'>Remove</Button>
                </div>
            </div>
        </div>
    );
}