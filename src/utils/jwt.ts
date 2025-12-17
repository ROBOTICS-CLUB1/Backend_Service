import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
  role: "user" | "admin";
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
};
