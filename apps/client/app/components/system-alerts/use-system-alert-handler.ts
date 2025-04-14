import { useLocalStorage } from "@uidotdev/usehooks"

export interface ISystemAlertHandler {
	/** Date to discontinue showing this alert. If this is `undefined`, the alert will always display, as long as it has not yet been dismissed. */
	endDate?: Date
	/** Key for local storage to store when alert message is dismissed. */
	localStorageKey: string
	/** Date to begin showing this alert. */
	startDate: Date
	/** Description of alert */
	identifier: string
}

const rightAboutNow = new Date()

export function useSystemAlertHandler(data: ISystemAlertHandler){
    const [isClosed, setIsClosed] = useLocalStorage<boolean>(data.localStorageKey);

    function handleAlertClose() {
        setIsClosed(true)
    }

    const showBanner = Boolean(
        !isClosed &&
            rightAboutNow >= data.startDate &&
            (data?.endDate ? rightAboutNow < data.endDate : !data.endDate),
    )

    return { show: showBanner, onClose: handleAlertClose }
}