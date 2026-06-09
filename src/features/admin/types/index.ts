// admin feature types

export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "moderator";
  createdAt: Date;
}
