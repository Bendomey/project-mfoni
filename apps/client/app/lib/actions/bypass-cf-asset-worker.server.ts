

export const bypassCfAssetWorkerUrl = (url: string) => {
    const fullUrl = new URL(url)
    fullUrl.searchParams.set('bypass_cf_worker', 'true')

    return fullUrl.toString()
}