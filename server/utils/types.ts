export interface SessionUser {
  id: string;
  username: string;
  role: "admin" | "employee";
}
