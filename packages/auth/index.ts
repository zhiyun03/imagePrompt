export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin?: boolean;
}

export { authOptions } from "./nextauth";
export { getCurrentUser } from "./nextauth";
export { auth } from "./nextauth";
