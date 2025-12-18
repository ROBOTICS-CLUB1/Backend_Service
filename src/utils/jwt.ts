import { JwtPayloadCustom } from "../types/jwtPayload";
import jwt from "jsonwebtoken";

export const signToken = (payload: JwtPayloadCustom) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
};
