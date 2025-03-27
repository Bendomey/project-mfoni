import { requestTokenSignature, accessTokenSignature } from "./signature.js";

interface RequestTokenResponse {
  oauth_token: string;
  oauth_token_secret: string;
  oauth_callback_confirmed: string;
  screen_name?: string;
  user_id?: string;
}

const parseOAuthRequestToken = (responseText: string) =>
  responseText.split("&").reduce<RequestTokenResponse>(
    (prev, el) => {
      const [key, value] = el.split("=");
      if (key && value) {
        return { ...prev, [key]: value };
      }

      return prev;
    },
    {
      oauth_token: "",
      oauth_token_secret: "",
      oauth_callback_confirmed: "false",
    },
  );

export const obtainOauthRequestToken = async ({
  consumerKey,
  consumerSecret,
  callbackUrl,
  method,
  apiUrl,
}: {
  method: string;
  apiUrl: string;
  callbackUrl: string;
  consumerKey: string;
  consumerSecret: string;
}) => {
  const oauthSignature = requestTokenSignature({
    method,
    apiUrl,
    callbackUrl,
    consumerKey,
    consumerSecret,
  });
  const res = await fetch(apiUrl, {
    method,
    headers: {
      Authorization: `OAuth ${oauthSignature}`,
    },
  });
  const responseText = await res.text();
  return parseOAuthRequestToken(responseText);
};

export const obtainOauthAccessToken = async ({
  consumerKey,
  consumerSecret,
  oauthToken,
  oauthVerifier,
  method,
  apiUrl,
}: {
  method: string;
  apiUrl: string;
  consumerKey: string;
  consumerSecret: string;
  oauthToken: string;
  oauthVerifier: string;
}) => {
  const oauthSignature = accessTokenSignature({
    method,
    apiUrl,
    consumerKey,
    consumerSecret,
    oauthToken,
    oauthVerifier,
  });
  const res = await fetch(apiUrl, {
    method,
    headers: {
      Authorization: `OAuth ${oauthSignature}`,
    },
  });
  const responseText = await res.text();
  return parseOAuthRequestToken(responseText);
};
