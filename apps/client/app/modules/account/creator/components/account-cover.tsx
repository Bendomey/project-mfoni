import {ShareIcon, UserIcon, MapPinIcon} from '@heroicons/react/24/outline'
import {Button} from '@/components/button/index.tsx'
import {Image} from 'remix-image'
import {Link} from '@remix-run/react'
import {PAGES} from '@/constants/index.ts'
import {useValidateImage} from '@/hooks/use-validate-image.tsx'

const profile = {
  name: 'Ricardo Cooper',
  imageUrl:
    'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
  coverImageUrl:
    'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
  about: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit!',
  interests: [
    'wallpaper',
    'nature',
    'background',
    'love',
    'business',
    'money',
    'office',
    'people',
  ],
}

const getNameInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n[0])
    .join('')

export const AccountCover = () => {
  const isProfilePhotoValid = useValidateImage(profile.imageUrl)

  return (
    <div className="border border-gray-200 bg-white pb-5 rounded-md">
      <div>
        <img
          alt=""
          src={profile.coverImageUrl}
          className="h-32 w-full object-cover lg:h-48"
        />
      </div>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
          <div className="flex">
            {profile.imageUrl && isProfilePhotoValid ? (
              <Image
                alt={profile.name}
                src={profile.imageUrl}
                className="size-24 rounded-full ring-4 ring-white sm:size-32"
              />
            ) : (
              <span className="inline-flex size-24 items-center justify-center rounded-full bg-blue-600 text-white ring-4 ring-white">
                <span className="text-4xl font-medium leading-none">
                  {getNameInitials(profile.name)}
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
        <div className="mt-4 min-w-0 flex-1 block">
          <h1 className="truncate text-2xl font-bold text-gray-900">
            {profile.name}222
          </h1>
          <p>{profile.about}</p>
        </div>
        <div className="flex gap-5 items-center mt-5">
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
            <div className="flex items-center text-sm text-gray-500">Ghana</div>
          </div>
        </div>

        <div className="mt-10">
          <h1 className="text-sm text-gray-500">Interests</h1>
          <div className="flex flex-wrap gap-2 items-center mt-2">
            {profile.interests.map((tag, index) => (
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
  )
}
