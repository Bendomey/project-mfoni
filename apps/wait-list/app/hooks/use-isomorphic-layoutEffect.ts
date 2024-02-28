/* eslint-disable no-negated-condition */
import {useEffect, useLayoutEffect} from 'react'

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect
