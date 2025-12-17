export interface JwtPayloadCustom {
  id: string;
  role: "user" | "admin";
}
