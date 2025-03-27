import { OAuth2Client } from "google-auth-library";

const CLIENT_ID_GOOGLE = process.env.MFONI_GOOGLE_AUTH_CLIENT_ID;

export const authorizeGoogle = async (authToken: string) => {
  const client = new OAuth2Client(CLIENT_ID_GOOGLE);

  const data = await client.verifyIdToken({
    idToken: authToken,
    audience: CLIENT_ID_GOOGLE,
  });

  const payload = data.getPayload();
  const uid = data.getUserId();

  if (!uid) {
    // send to sentry
    throw new Error("NoUserIdFound");
  }

  if (!payload?.name) {
    throw new Error("NoUserNameFound");
  }

  return {
    uid,
    name: payload.name,
    email: payload.email,
    userPhoto: payload.picture,
  };
};
