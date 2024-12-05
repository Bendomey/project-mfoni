import {
    ShareIcon,
    UserIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/button/index.tsx'
import { useAuth } from '@/providers/auth/index.tsx'
import { useValidateImage } from '@/hooks/use-validate-image.tsx'
import { Image } from 'remix-image'
import { Link } from '@remix-run/react'
import { PAGES } from '@/constants/index.ts'

export const profile = {
    name: 'Ricardo Cooper',
    imageUrl:
        'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
    coverImageUrl:
        'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    about: `
          <p>Tincidunt quam neque in cursus viverra orci, dapibus nec tristique. Nullam ut sit dolor consectetur urna, dui cras nec sed. Cursus risus congue arcu aenean posuere aliquam.</p>
          <p>Et vivamus lorem pulvinar nascetur non. Pulvinar a sed platea rhoncus ac mauris amet. Urna, sem pretium sit pretium urna, senectus vitae. Scelerisque fermentum, cursus felis dui suspendisse velit pharetra. Augue et duis cursus maecenas eget quam lectus. Accumsan vitae nascetur pharetra rhoncus praesent dictum risus suspendisse.</p>
        `,
    fields: {
        Phone: '(555) 123-4567',
        Email: 'ricardocooper@example.com',
        Title: 'Senior Front-End Developer',
        Team: 'Product Development',
        Location: 'San Francisco',
        Sits: 'Oasis, 4th floor',
        Salary: '$145,000',
        Birthday: 'June 8, 1990',
    },
}
const getNameInitials = (name: string) =>
    name
        .split(' ')
        .map(n => n[0])
        .join('')


const tags = [
    'wallpaper',
    'nature',
    'background',
    'love',
    'business',
    'money',
    'office',
    'people',
]


export const AccountCover = () => {
    const { currentUser } = useAuth()
    const isProfilePhotoValid = useValidateImage(currentUser?.photo ?? '')
    const initials = getNameInitials(currentUser?.name ?? '')

    return (
        <div className="border border-gray-200 bg-white rounded-md shadow-sm">
            <div>
                <div>
                    <Image
                        alt={`${profile.name}'s cover photo`}
                        src={profile.coverImageUrl}
                        className="h-32 w-full object-cover lg:h-48 rounded-t-md"
                    />
                </div>
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
                        <div className="flex">
                            {isProfilePhotoValid && currentUser?.photo ? (
                                <Image
                                    alt={currentUser.name}
                                    src={currentUser.photo}
                                    className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                                />
                            ) : (
                                <span className="inline-flex h-32 w-32 items-center justify-center rounded-full bg-blue-600 text-white ring-4 ring-white">
                                    <span className="text-4xl font-medium leading-none">
                                        {initials}
                                    </span>
                                </span>
                            )}
                        </div>
                        <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                            <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                                <Button className="w-full md:w-auto">
                                    <UserIcon className="mr-3 h-4 w-4" aria-hidden="true" />
                                    Follow
                                </Button>
                                <Button
                                    variant="solid"
                                    color="secondaryGhost"
                                    className="w-full md:w-auto"
                                >
                                    <ShareIcon className="mr-3 h-5 w-5 " aria-hidden="true" />
                                    Share
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="my-3">
                        <div className="">
                            <h1 className="truncate text-2xl font-bold text-gray-900">
                                {currentUser?.name}
                            </h1>
                            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit!</p>
                        </div>
                        <div className='flex gap-5 items-center mt-5'>


                            <div className="flex items-center gap-1">
                                <div className="flex -space-x-1 overflow-hidden">
                                    <Image
                                        alt=""
                                        src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                        className="inline-block size-5 rounded-full ring-2 ring-white"
                                    />
                                    <Image
                                        alt=""
                                        src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                        className="inline-block size-5 rounded-full ring-2 ring-white"
                                    />
                                    <Image
                                        alt=""
                                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
                                        className="inline-block size-5 rounded-full ring-2 ring-white"
                                    />
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    125,000 Followers
                                </div>

                            </div>

                            <div className="flex items-center gap-1">
                                <MapPinIcon className="h-5 w-5 text-gray-500" />
                                <div className="flex items-center text-sm text-gray-500">
                                    Ghana
                                </div>

                            </div>
                        </div>


                        <div className='mt-10'>
                            <h1 className='text-sm text-gray-500'>Interests</h1>
                            <div className="flex flex-wrap gap-2 items-center mt-2">
                                {tags.map((tag, index) => (
                                    <Link key={index} to={PAGES.TAG.replace(':tag', tag)}>
                                        <div className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">
                                            <span className="text-xs text-gray-600 font-medium">
                                                {tag}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}