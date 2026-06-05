import { ROUTES } from "@/constants";
import type { User } from "@/types";

export function isPlatformSuperadmin(user: User | null | undefined): boolean {
  return user?.is_superadmin === true;
}

export const CLIENT_OPERATIONAL_PATHS: readonly string[] = [
  ROUTES.AUTH.DASHBOARD,
  ROUTES.AUTH.MONITOR,
  ROUTES.AUTH.CAMERA,
  ROUTES.AUTH.WHITELIST,
  ROUTES.AUTH.LOGS,
];
