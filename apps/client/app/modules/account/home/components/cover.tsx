import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import {
  UserIcon,
  CheckIcon,
  ArchiveBoxIcon,
  MapPinIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/button/index.tsx";
import { Image } from "@/components/Image.tsx";
import { ShareButton } from "@/components/share-button/index.tsx";
import { MFONI_PACKAGES_DETAILED } from "@/constants/index.ts";
import { useValidateImage } from "@/hooks/use-validate-image.tsx";
import { classNames } from "@/lib/classNames.ts";
import { isBrowser } from "@/lib/is-browser.ts";
import { getNameInitials } from "@/lib/misc.ts";
import { safeString } from "@/lib/strings.ts";
import { useAuth } from "@/providers/auth/index.tsx";

interface Props {
  application: CreatorApplication;
}

function CreatorApplicationBanner({ application }: Props) {
  const color = application.status === "SUBMITTED" ? "yellow" : "red";
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
            {application.status == "SUBMITTED" ? (
              <p>
                Your application is in review. Support will reach back with
                updates soon. Hang tight!
              </p>
            ) : application.status === "REJECTED" ? (
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
  );
}

export function AccountCover() {
  const { currentUser, activeCreatorApplication } = useAuth();
  const isProfilePhotoValid = useValidateImage(safeString(currentUser?.photo));
  const initials = getNameInitials(safeString(currentUser?.name));

  const isAccountVerified = Boolean(
    currentUser?.emailVerifiedAt && currentUser.phoneNumberVerifiedAt,
  );

  return (
    <div className="rounded-md border border-gray-200 bg-white pb-5">
      <div>
        <img
          alt={`${currentUser?.name}'s cover`}
          src="https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          className="h-32 w-full rounded-t-md object-cover lg:h-48"
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
              <span className="inline-flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-blue-600 text-white ring-4 ring-white">
                <span className="text-4xl font-medium leading-none">
                  {initials}
                </span>
              </span>
            )}
          </div>
          <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
            <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-x-2 sm:space-y-0">
              {currentUser?.role === "CREATOR" ? (
                <ShareButton
                  buttonProps={{
                    variant: "solid",
                    className: "w-full md:w-auto",
                  }}
                  link={
                    isBrowser
                      ? `${window.location.origin}/${safeString(
                          currentUser?.creator?.username,
                        )}`
                      : undefined
                  }
                  text={`View ${currentUser.name}'s mfoni profile`}
                />
              ) : null}
              <Button variant="outlined">
                <UserIcon
                  aria-hidden="true"
                  className="-ml-0.5 mr-1.5 h-5 w-5"
                />
                <span>Edit Profile</span>
              </Button>

              {isAccountVerified ? null : (
                <Button
                  isLink
                  href="/account/verify"
                  variant="solid"
                  color="secondaryGhost"
                  className="w-full md:w-auto"
                >
                  <CheckIcon className="mr-2 h-5 w-auto" /> Verify Account
                </Button>
              )}

              {activeCreatorApplication &&
              Boolean(activeCreatorApplication.status === "PENDING") ? (
                <Button
                  isLink
                  href="/account?complete-creator-application=true"
                  variant="solid"
                  color="secondaryGhost"
                  className="w-full md:w-auto"
                >
                  <CheckIcon className="mr-2 h-5 w-auto" /> Complete Creator
                  Application
                </Button>
              ) : null}

              {currentUser?.role === "CREATOR" ||
              activeCreatorApplication ? null : (
                <Button
                  isLink
                  href="/account?complete-creator-application=true"
                  variant="solid"
                  color="secondaryGhost"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-80 md:w-auto"
                >
                  Become a Creator
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 block min-w-0 flex-1">
          <div className="flex flex-row items-center gap-1">
            <h1 className="truncate text-2xl font-bold text-gray-900">
              {currentUser?.name}
            </h1>
            {currentUser?.role === "CREATOR" ? (
              <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-700/10">
                Creator
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-col gap-3 sm:mt-2 sm:flex-row sm:flex-wrap sm:items-center md:gap-5">
            {currentUser?.creator?.subscription.packageType ? (
              <div className="flex items-center text-sm text-gray-500">
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

            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 text-gray-500" />
              <div className="flex items-center text-sm text-gray-500">
                Ghana
              </div>
            </div>

            {currentUser?.role === "CREATOR" ? (
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
            ) : null}
          </div>
          {currentUser?.role === "CREATOR" ? (
            <div className="mt-5 flex flex-row flex-wrap items-center gap-3 md:mt-2 md:gap-1">
              <div>
                <Button
                  variant="unstyled"
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <GlobeAltIcon className="h-6 w-6 text-gray-400" />
                </Button>
              </div>
              <div>
                <Button
                  variant="unstyled"
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    x="0px"
                    y="0px"
                    width="100"
                    height="100"
                    viewBox="0 0 50 50"
                  >
                    <path d="M 16 3 C 8.8324839 3 3 8.8324839 3 16 L 3 34 C 3 41.167516 8.8324839 47 16 47 L 34 47 C 41.167516 47 47 41.167516 47 34 L 47 16 C 47 8.8324839 41.167516 3 34 3 L 16 3 z M 16 5 L 34 5 C 40.086484 5 45 9.9135161 45 16 L 45 34 C 45 40.086484 40.086484 45 34 45 L 16 45 C 9.9135161 45 5 40.086484 5 34 L 5 16 C 5 9.9135161 9.9135161 5 16 5 z M 37 11 A 2 2 0 0 0 35 13 A 2 2 0 0 0 37 15 A 2 2 0 0 0 39 13 A 2 2 0 0 0 37 11 z M 25 14 C 18.936712 14 14 18.936712 14 25 C 14 31.063288 18.936712 36 25 36 C 31.063288 36 36 31.063288 36 25 C 36 18.936712 31.063288 14 25 14 z M 25 16 C 29.982407 16 34 20.017593 34 25 C 34 29.982407 29.982407 34 25 34 C 20.017593 34 16 29.982407 16 25 C 16 20.017593 20.017593 16 25 16 z" />
                  </svg>
                </Button>
              </div>
              <div>
                <Button
                  variant="unstyled"
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    x="0px"
                    y="0px"
                    width="100"
                    height="100"
                    viewBox="0 0 30 30"
                  >
                    <path d="M26.37,26l-8.795-12.822l0.015,0.012L25.52,4h-2.65l-6.46,7.48L11.28,4H4.33l8.211,11.971L12.54,15.97L3.88,26h2.65 l7.182-8.322L19.42,26H26.37z M10.23,6l12.34,18h-2.1L8.12,6H10.23z" />
                  </svg>
                </Button>
              </div>
              <div>
                <Button
                  variant="unstyled"
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    x="0px"
                    y="0px"
                    width="100"
                    height="100"
                    viewBox="0 0 50 50"
                  >
                    <path d="M 25 3 C 12.861562 3 3 12.861562 3 25 C 3 36.019135 11.127533 45.138355 21.712891 46.728516 L 22.861328 46.902344 L 22.861328 29.566406 L 17.664062 29.566406 L 17.664062 26.046875 L 22.861328 26.046875 L 22.861328 21.373047 C 22.861328 18.494965 23.551973 16.599417 24.695312 15.410156 C 25.838652 14.220896 27.528004 13.621094 29.878906 13.621094 C 31.758714 13.621094 32.490022 13.734993 33.185547 13.820312 L 33.185547 16.701172 L 30.738281 16.701172 C 29.349697 16.701172 28.210449 17.475903 27.619141 18.507812 C 27.027832 19.539724 26.84375 20.771816 26.84375 22.027344 L 26.84375 26.044922 L 32.966797 26.044922 L 32.421875 29.564453 L 26.84375 29.564453 L 26.84375 46.929688 L 27.978516 46.775391 C 38.71434 45.319366 47 36.126845 47 25 C 47 12.861562 37.138438 3 25 3 z M 25 5 C 36.057562 5 45 13.942438 45 25 C 45 34.729791 38.035799 42.731796 28.84375 44.533203 L 28.84375 31.564453 L 34.136719 31.564453 L 35.298828 24.044922 L 28.84375 24.044922 L 28.84375 22.027344 C 28.84375 20.989871 29.033574 20.060293 29.353516 19.501953 C 29.673457 18.943614 29.981865 18.701172 30.738281 18.701172 L 35.185547 18.701172 L 35.185547 12.009766 L 34.318359 11.892578 C 33.718567 11.811418 32.349197 11.621094 29.878906 11.621094 C 27.175808 11.621094 24.855567 12.357448 23.253906 14.023438 C 21.652246 15.689426 20.861328 18.170128 20.861328 21.373047 L 20.861328 24.046875 L 15.664062 24.046875 L 15.664062 31.566406 L 20.861328 31.566406 L 20.861328 44.470703 C 11.816995 42.554813 5 34.624447 5 25 C 5 13.942438 13.942438 5 25 5 z" />
                  </svg>
                </Button>
              </div>
            </div>
          ) : null}

          {activeCreatorApplication &&
          ["SUBMITTED", "REJECTED"].includes(
            activeCreatorApplication.status,
          ) ? (
            <div className="mt-5">
              <CreatorApplicationBanner
                application={activeCreatorApplication}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
