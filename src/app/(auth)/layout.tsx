"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  CLIENT_OPERATIONAL_PATHS,
  isPlatformSuperadmin,
} from "@/lib/auth/roles";
import { ROUTES } from "@/constants";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/ui/Sidebar";
import { Box, CircularProgress } from "@mui/material";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (isLoading || !user) return;
    if (
      isPlatformSuperadmin(user) &&
      CLIENT_OPERATIONAL_PATHS.includes(pathname)
    ) {
      router.replace(ROUTES.AUTH.SETTINGS);
      return;
    }
    if (!isPlatformSuperadmin(user) && pathname === ROUTES.AUTH.USERS_CREATE) {
      router.replace(ROUTES.AUTH.DASHBOARD);
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return <Sidebar>{children}</Sidebar>;
}
