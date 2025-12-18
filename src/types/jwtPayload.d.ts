export type UserRole = "user" | "member" | "admin";

export interface JwtPayloadCustom {
  id: string;
  role: UserRole;
  membershipStatus: "pending" | "approved" | "rejected" | "expired";
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadCustom;
    }
  }
}
