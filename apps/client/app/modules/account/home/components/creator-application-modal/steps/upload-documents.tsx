
interface Props {
    idType: string
    setIdType: (value: string) => void
    frontId: string
    setFrontId: (value: string) => void
    backId: string
    setBackId: (value: string) => void
}

export function UploadDocuments({
    idType,
    setIdType
}: Props) {
    return (
        <div>
            <h1 className="font-bold text-xl">2. Upload Your ID Card</h1>
            <div className="ml-5">
                <p className="text-sm text-gray-600 mt-1">Any type of Ghanaian ID Card is acceptable. Please make sure the images are not blurry. Your application might get rejected because of that</p>

                <div className="mt-5">
                    <label htmlFor="type" className="block text-sm font-medium leading-6 text-gray-900">
                        ID Type
                    </label>
                    <div className="mt-1 lg:w-5/6">
                        <select
                            id="type"
                            name="type"
                            value={idType}
                            onChange={(e) => setIdType(e.target.value)}
                            className="block w-full rounded-md border-0 py-3 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                        >
                            <option value=''>Please Select</option>
                            <option value="GHANA_CARD">Ghana Card</option>
                            <option value="VOTER">Voter&apos;s ID</option>
                            <option value="DRIVERS_LICENSE">Driver&apos;s License</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}