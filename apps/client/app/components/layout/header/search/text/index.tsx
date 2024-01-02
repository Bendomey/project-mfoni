import { Button } from '@/components/button/index.tsx'
import { MagnifyingGlassIcon, ArrowTrendingUpIcon, RectangleGroupIcon } from '@heroicons/react/24/outline'

export const TextSearch = () => {
    return (
        <div className="px-2">
            <div className="flex flex-row items-center justify-between mt-2">
                <h1 className="font-bold text-xl md:text-lg">Recent Searches</h1>
                <Button variant="unstyled" externalClassName="text-sm text-zinc-400 hover:underline">Clear</Button>
            </div>
            <div className="flex flex-row items-center flex-wrap gap-3 mt-4">
                {
                    ['Nature', 'People', 'Food', 'Animals', 'Architecture', 'Interiors', 'Current Events', 'Business & Work', ].map((item, index) => (
                        <Button size='sm' key={index} variant="outline" >
                            <div className="flex flex-row items-center text-gray-600 font-base"> <MagnifyingGlassIcon className="h-3 w-3 mr-2"  /> {item}</div>
                        </Button>
                    ))
                }
            </div>

            <div className="flex flex-row items-center justify-between mt-10">
                <h1 className="font-bold text-xl md:text-lg">🚀 Trending Collections</h1>
            </div>
            <div className="flex flex-row items-center flex-wrap gap-3 mt-4">
                {
                    ['Nature', 'People', 'Food', 'Animals', 'Architecture', 'Interiors', 'Current Events', 'Business & Work', ].map((item, index) => (
                        <Button size='sm' key={index} variant="outline" >
                            <div className="flex flex-row items-center"> <ArrowTrendingUpIcon className="h-5 w-5 mr-2"  /> {item}</div>
                        </Button>
                    ))
                }
            </div>

            <div className="flex flex-row items-center justify-between mt-10">
                <h1 className="font-bold text-xl md:text-lg">Popular Tags 🔥</h1>
            </div>
            <div className="flex flex-row items-center flex-wrap gap-3 mt-4">
                {
                    ['Nature', 'People', 'Food', 'Animals', 'Architecture', 'Interiors', 'Current Events', 'Business & Work', ].map((item, index) => (
                        <Button key={index} variant="outline" >
                            <div className="flex flex-row items-center"><RectangleGroupIcon className="h-5 w-5 mr-2" /> {item}</div>
                        </Button>
                    ))
                }
            </div>
        </div>
    )
}
