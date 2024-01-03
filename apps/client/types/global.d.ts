/* eslint-disable @typescript-eslint/no-empty-interface */
/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node/globals" />

type PossiblyUndefined<T> = T | undefined
type Nullable<T> = T | null
type StringList = Array<string>
type NumberList = Array<number>
type BooleanList = Array<boolean>
type StringRecord = Record<string, string>
type NumberRecord = Record<string, number>
type BooleanRecord = Record<string, boolean>
type StringMap = Map<string, string>
type NumberMap = Map<string, number>
type BooleanMap = Map<string, boolean>



declare global {
    interface Window {
    }
}