import { data as json } from '@remix-run/node'

export const jsonWithCache = <Data>(data: Data, init?: number | ResponseInit) =>
	json(
		data,
		typeof init === 'number'
			? init
			: {
					headers: {
						'Cache-Control': 'public, max-age=604800',
						...(init?.headers ? init.headers : {}),
					},
					...(init ? init : {}),
				},
	)
