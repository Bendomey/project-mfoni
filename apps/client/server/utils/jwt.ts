import jsonWebToken from 'jsonwebtoken'

export function verifyJwt(token: string) {
    try {
        const decoded = jsonWebToken.verify(token, process.env.REMIX_SERVER_JWT_SECRET!, {
            issuer: process.env.REMIX_SERVER_JWT_ISSUER!,
        })
        return Boolean(decoded)
    } catch {
        return false
    }
   
}
