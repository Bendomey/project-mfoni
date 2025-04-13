

// TODO: remove bypass after we come up with a better solution.
export const bypassCfAssetWorkerUrl = (url: string) => {
    const fullUrl = new URL(url)
    fullUrl.searchParams.set('bypass_cf_worker', 'true')

    return fullUrl.toString()
}