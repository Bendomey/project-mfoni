import { Link } from "@remix-run/react";

interface Props {
    mfoniPackage: string
    setMfoniPackage: (value: string) => void
}

export function SelectPackage({ mfoniPackage, setMfoniPackage }: Props) {
    return (
        <div>
            <h1 className="font-bold text-xl">1. Choose a package</h1>
            <div className="ml-5">
                <p className="text-sm text-gray-600 mt-1">The package you select will reflect what your benefits are! <Link to='/#pricing' target="_blank" className="text-blue-600 hover:underline">Click to see packages</Link> </p>
                <div className="mt-5 lg:w-5/6">
                    <select
                        id="package"
                        name="package"
                        value={mfoniPackage}
                        onChange={(e) => setMfoniPackage(e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-3 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                    >
                        <option value=''>Please Select</option>
                        <option value='FREE'>Snap & Share (Free Tier)</option>
                        <option value='BASIC'>Pro Lens (Basic Premium Tier)</option>
                        <option value='ADVANCED'>Master Shot (Advanced Premium Tier)</option>
                    </select>
                </div>
            </div>
        </div>
    )
}