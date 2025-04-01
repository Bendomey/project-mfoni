import { useEffect, useLayoutEffect } from 'react'

export const isSSR = typeof window === 'undefined' || !window.navigator

export const isBrowser = !isSSR

export const useIsomorphicEffect = isBrowser ? useLayoutEffect : useEffect
