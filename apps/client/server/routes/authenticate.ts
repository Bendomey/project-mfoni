import * as express from "express";
import { authorizeFacebook } from "../utils/facebook/authorize.js";
import { authorizeGoogle } from "../utils/google/authorize.js";
import { authorizeTwitter } from "../utils/twitter/authorize.js";

const authRouter = express.Router();

interface AuthenticateInputProps {
  provider: "GOOGLE" | "TWITTER" | "FACEBOOK";
  uid: string;
  name: string;
  email?: string;
  userPhoto?: string;
}

authRouter.post("/", async (req, res) => {
  try {
    let inputData: AuthenticateInputProps;
    switch (req.body.provider) {
      case "GOOGLE": {
        const { authToken } = req.body.google;
        const googleData = await authorizeGoogle(authToken);
        inputData = {
          ...googleData,
          provider: req.body.provider,
        };
        break;
      }
      case "TWITTER": {
        const twitterData = await authorizeTwitter(req.body.twitter);
        inputData = {
          ...twitterData,
          provider: req.body.provider,
        };
        break;
      }
      case "FACEBOOK": {
        const facebookData = await authorizeFacebook(req.body.facebook);
        inputData = {
          ...facebookData,
          provider: req.body.provider,
        };
        break;
      }
      default: {
        return res.json({ data: "InvalidProvider" }).status(400);
      }
    }

    const apiReq = await fetch(`${process.env.API_ADDRESS}/api/v1/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputData),
    });

    const data = await apiReq.json();
    return res.status(200).json(data);
  } catch (error: unknown) {
    return res.status(400).json({ data: error });
  }
});

export { authRouter };
