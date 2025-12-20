import { JwtPayloadCustom } from "./jwtPayload";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadCustom;
      parentModel?: "Post" | "Project";
    }
  }
}

export {};
