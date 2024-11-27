import {
  ShareIcon,
  UserIcon,
  CheckIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline'
import {Button} from '@/components/button/index.tsx'
import {useAuth} from '@/providers/auth/index.tsx'
import {useValidateImage} from '@/hooks/use-validate-image.tsx'
import {useAccountContext} from '../context/index.tsx'
import {ExclamationTriangleIcon} from '@heroicons/react/20/solid'
import {classNames} from '@/lib/classNames.ts'
import {MFONI_PACKAGES_DETAILED} from '@/constants/index.ts'

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

interface Props {
  application: CreatorApplication
}

function CreatorApplicationBanner({application}: Props) {
  const color = application.status === 'SUBMITTED' ? 'yellow' : 'red'
  return (
    <div className={classNames(`rounded-md bg-${color}-50 p-4`)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon
            aria-hidden="true"
            className={classNames(`h-5 w-5 text-${color}-400`)}
          />
        </div>
        <div className="ml-3">
          <h3 className={classNames(`text-sm font-medium text-${color}-800`)}>
            Creator Application Updates
          </h3>
          <div className={classNames(`mt-2 text-sm text-${color}-700`)}>
            {application.status == 'SUBMITTED' ? (
              <p>
                Your application is in review. Support will reach back with
                updates soon. Hang tight!
              </p>
            ) : application.status === 'REJECTED' ? (
              <>
                <p>
                  Your application was rejected unfortunately. Click on the
                  &apos;Become a Creator&apos; button below to re-apply.
                </p>
                {application.rejectedReason ? (
                  <b>Reason: {application.rejectedReason}</b>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export const AccountCover = () => {
  const {currentUser} = useAuth()
  const {activeCreatorApplication} = useAccountContext()
  const isProfilePhotoValid = useValidateImage(currentUser?.photo ?? '')
  const initials = getNameInitials(currentUser?.name ?? '')

  const isAccountNotVerified = Boolean(
    !currentUser?.emailVerifiedAt || !currentUser.phoneNumberVerifiedAt,
  )

  return (
    <div className="border border-gray-200 bg-white rounded-md shadow-sm">
      <div>
        <div>
          <img
            alt=""
            src={profile.coverImageUrl}
            className="h-32 w-full object-cover lg:h-48 rounded-t-md"
          />
        </div>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
            <div className="flex">
              {isProfilePhotoValid && currentUser?.photo ? (
                <img
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
                <Button variant="outlined">
                  <UserIcon
                    aria-hidden="true"
                    className="-ml-0.5 mr-1.5 h-5 w-5"
                  />
                  <span>Edit Profile</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="my-3">
            <div className="flex flex-row items-center gap-1">
              <h1 className="truncate text-2xl font-bold text-gray-900">
                {currentUser?.name}
              </h1>
              {currentUser?.role ? (
                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-700/10">
                  {currentUser.role === 'CLIENT' ? 'User' : 'Creator'}
                </span>
              ) : null}
            </div>
            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-8">
              {currentUser?.creator?.subscription.packageType ? (
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <ArchiveBoxIcon
                    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                  {
                    MFONI_PACKAGES_DETAILED[
                      currentUser.creator.subscription.packageType
                    ].name
                  }
                </div>
              ) : null}
            </div>
            {activeCreatorApplication &&
            ['SUBMITTED', 'REJECTED'].includes(
              activeCreatorApplication.status,
            ) ? (
              <div className="my-5">
                <CreatorApplicationBanner
                  application={{
                    ...activeCreatorApplication,
                    status: 'SUBMITTED',
                  }}
                />
              </div>
            ) : null}

            <div className="mt-4 flex flex-col md:flex-row items-center gap-x-2 gap-y-4">
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
              {isAccountNotVerified ? (
                <Button
                  isLink
                  href="/account/verify"
                  variant="solid"
                  color="secondaryGhost"
                  className="w-full md:w-auto"
                >
                  <CheckIcon className="h-5 w-auto mr-2" /> Verify Account
                </Button>
              ) : activeCreatorApplication &&
                Boolean(activeCreatorApplication.status === 'PENDING') ? (
                <Button
                  isLink
                  href="/account?complete-creator-application=true"
                  variant="solid"
                  color="secondaryGhost"
                  className="w-full md:w-auto "
                >
                  <CheckIcon className="h-5 w-auto mr-2" /> Complete Creator
                  Application
                </Button>
              ) : // eslint-disable-next-line no-negated-condition
              !activeCreatorApplication ? (
                <Button
                  isLink
                  href="/account?complete-creator-application=true"
                  variant="solid"
                  color="secondaryGhost"
                  className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-80"
                >
                  Become a Creator
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
