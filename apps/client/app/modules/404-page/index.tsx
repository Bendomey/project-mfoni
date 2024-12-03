/* eslint-disable jsx-a11y/anchor-is-valid */

import {APP_NAME} from '@/constants/index.ts'
import {Link} from '@remix-run/react'

export const NotFoundModule = () => {
  return (
    <div className="grid h-[100dvh] lg:h-[100vh] grid-cols-1 grid-rows-[1fr,auto,1fr] bg-white lg:grid-cols-[max(50%,36rem),1fr]">
      <header className="mx-auto w-full max-w-7xl px-6 pt-6 sm:pt-10 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:px-8">
        <Link prefetch="intent" to="/" className="-m-1.5 p-1.5">
          <div className="flex flex-row items-end">
            <span className="text-4xl text-blue-700 font-extrabold">
              {APP_NAME.slice(0, 1)}
            </span>
            <span className="text-4xl font-extrabold">{APP_NAME.slice(1)}</span>
          </div>
        </Link>
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 py-24 sm:py-32 lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:px-8">
        <div className="max-w-lg">
          <p className="text-base font-semibold leading-8 text-blue-600">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Page not found
          </h1>
          <p className="mt-6 text-base leading-7 text-gray-600">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="mt-10">
            <Link
              to="/"
              prefetch="intent"
              className="text-sm font-semibold leading-7 text-blue-600"
            >
              <span aria-hidden="true">&larr;</span> Back to home
            </Link>
          </div>
        </div>
      </main>
      <footer className="self-end lg:col-span-2 lg:col-start-1 lg:row-start-3">
        <div className="border-t border-gray-100 bg-gray-50 py-10">
          <nav className="mx-auto flex w-full max-w-7xl items-center gap-x-4 px-6 text-sm leading-7 text-gray-600 lg:px-8">
            <a href="#">Contact support</a>
            <svg
              viewBox="0 0 2 2"
              aria-hidden="true"
              className="h-0.5 w-0.5 fill-gray-300"
            >
              <circle cx={1} cy={1} r={1} />
            </svg>
            <a href="#">Status</a>
            <svg
              viewBox="0 0 2 2"
              aria-hidden="true"
              className="h-0.5 w-0.5 fill-gray-300"
            >
              <circle cx={1} cy={1} r={1} />
            </svg>
            <a href="#">Twitter</a>
          </nav>
        </div>
      </footer>
      <div className="hidden lg:relative lg:col-start-2 lg:row-start-1 lg:row-end-4 lg:block">
        <img
          src="https://images.unsplash.com/photo-1470847355775-e0e3c35a9a2c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1825&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
