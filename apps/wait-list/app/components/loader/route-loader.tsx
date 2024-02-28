/* eslint-disable react/jsx-no-useless-fragment */
import {useNavigation} from '@remix-run/react'

export const RouteLoader = () => {
  const navigation = useNavigation()
  const active = navigation.state !== 'idle'

  return (
    <>
      {active ? (
        <progress
          aria-hidden={!active}
          aria-valuetext="Loading"
          className="fixed inset-x-0 top-0 left-0 z-50 transition-all duration-500 ease-in-out h-1 w-full animate-pulse   "
        >
          <div className="h-full w-full  bg-gradient-to-r from-blue-500 to-cyan-500" />
        </progress>
      ) : null}
    </>
  )
}
