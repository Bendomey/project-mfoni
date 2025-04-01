export const authorizeFacebook = async ({
	accessToken,
}: {
	accessToken: string
}) => {
	const req = await fetch(
		`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`,
	)

	const json = await req.json()

	return {
		uid: json.id,
		name: json.name,

		// @TODO: verify dets after facebook approves our app!
		email: json.email,
		// userPhoto: json.picture.data.url,
	}
}
