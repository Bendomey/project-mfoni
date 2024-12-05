import { PAGES } from '@/constants/index.ts'
import { classNames } from '@/lib/classNames.ts'
import { safeString } from '@/lib/strings.ts'
import { FolderIcon } from '@heroicons/react/24/outline'
import {
    HeartIcon,
    PhotoIcon,
} from '@heroicons/react/24/solid'
import { Link, useLocation, useNavigate, useParams } from '@remix-run/react'
import { useMemo } from 'react'

export function Tabs() {
    const { username: usernameParam } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    const tabs = useMemo(
        () => [
            {
                name: 'Photos',
                href: PAGES.CREATOR.PHOTOS.replace(':username', safeString(usernameParam)),
                icon: PhotoIcon,
                current:
                    PAGES.CREATOR.PHOTOS.replace(':username', safeString(usernameParam)) ===
                    location.pathname,
                count: '52',
            },
            {
                name: 'Likes',
                href: PAGES.CREATOR.LIKES.replace(':username', safeString(usernameParam)),
                icon: HeartIcon,
                current:
                    PAGES.CREATOR.LIKES.replace(':username', safeString(usernameParam)) ===
                    location.pathname,
                count: '4',
            },
            {
                name: 'Collections',
                href: PAGES.CREATOR.COLLECTIONS.replace(
                    ':username',
                    safeString(usernameParam),
                ),
                icon: FolderIcon,
                count: '6',
                current:
                    PAGES.CREATOR.COLLECTIONS.replace(':username', safeString(usernameParam)) ===
                    location.pathname,
            },
        ],
        [location.pathname, usernameParam],
    )
    const activeTab = tabs.find(tab => tab.current)?.name ?? 'Photos'

    return (
        <div>
            <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                    Select a tab
                </label>
                {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
                <select
                    value={activeTab}
                    onChange={e => {
                        navigate(
                            tabs.find(tab => tab.name === e.target.value)?.href ??
                            PAGES.CREATOR.PHOTOS.replace(
                                ':username',
                                safeString(usernameParam),
                            ),
                        )
                    }}
                    id="tabs"
                    name="tabs"
                    className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                    {tabs.map(tab => (
                        <option key={tab.name}>{tab.name}</option>
                    ))}
                </select>
            </div>
            <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                    <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                        {tabs.map(tab => (
                            <Link
                                prefetch="intent"
                                key={tab.name}
                                to={tab.href}
                                aria-current={tab.current ? 'page' : undefined}
                                className={classNames(
                                    tab.current
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700',
                                    'flex whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                                )}
                            >
                                <div className="mr-1">
                                    <tab.icon className="h-5 w-5 text-gray-400" />
                                </div>
                                {tab.name}
                                {tab.count ? (
                                    <span
                                        className={classNames(
                                            tab.current
                                                ? 'bg-blue-100 text-blue-600'
                                                : 'bg-gray-100 text-gray-900',
                                            'ml-1 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block',
                                        )}
                                    >
                                        {tab.count}
                                    </span>
                                ) : null}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    )
}