"use client";

import React from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import {
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Shield as ShieldIcon,
} from "@mui/icons-material";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import AccountsTable from "@/components/features/accounts/AccountsTable";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import { MESSAGES, ROUTES } from "@/constants";

export default function SuperadminAccountsHub() {
  const { user } = useAuth();
  const {
    stats,
    statsLoading,
    statsError,
    refetchStats,
    listError,
    refetchList,
  } = useUsers();

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1.5,
            mb: 1,
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
          >
            {MESSAGES.ACCOUNTS.HUB_TITLE}
          </Typography>
          <Chip
            label={MESSAGES.ACCOUNTS.ROLE_SUPERADMIN}
            color="primary"
            size="small"
            sx={{ fontWeight: 600, maxWidth: "100%" }}
          />
        </Box>
        <Typography variant="body1" color="text.secondary">
          {MESSAGES.ACCOUNTS.HUB_SUBTITLE}
        </Typography>
      </Box>

      {statsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : statsError ? (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => void refetchStats()}>
              {MESSAGES.ACCOUNTS.RETRY}
            </Button>
          }
        >
          {MESSAGES.ACCOUNTS.STATS_LOAD_ERROR}
        </Alert>
      ) : stats ? (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title={MESSAGES.ACCOUNTS.STATS_TOTAL}
              value={stats.total_accounts}
              icon={<GroupIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title={MESSAGES.ACCOUNTS.STATS_CLIENT_ADMINS}
              value={stats.client_admin_count}
              icon={<AdminIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title={MESSAGES.ACCOUNTS.STATS_SUPERADMINS}
              value={stats.superadmin_count}
              icon={<ShieldIcon sx={{ fontSize: 40 }} />}
              color="info"
            />
          </Grid>
        </Grid>
      ) : null}

      <Alert severity="info" sx={{ mb: 3 }}>
        {MESSAGES.ACCOUNTS.INFO_SEPARATION}
        {user?.email && (
          <>
            {" "}
            Sessão ativa: <strong>{user.email}</strong>.
          </>
        )}
      </Alert>

      <Box sx={{ mb: 3 }}>
        <Card hover={false} title={MESSAGES.ACCOUNTS.CREATE_PRIMARY}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { md: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Contas criadas aqui são{" "}
                <strong>administradores do cliente</strong>, operam o Mantis no
                dia a dia e tem acesso a:
              </Typography>
              <Box
                component="ol"
                sx={{
                  m: 0,
                  pl: 2.5,
                  color: "text.secondary",
                  "& li": { mb: 0.75 },
                  "& li::marker": { fontWeight: 700, color: "text.primary" },
                }}
              >
                {MESSAGES.ACCOUNTS.CLIENT_ADMIN_BULLETS.map((item) => (
                  <Typography
                    key={item}
                    component="li"
                    variant="body2"
                    sx={{ fontWeight: 600, color: "text.primary" }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>
            </Box>
            <Button
              component={Link}
              href={ROUTES.AUTH.USERS_CREATE}
              variant="contained"
              startIcon={<PersonAddIcon />}
              sx={{ flexShrink: 0, alignSelf: { xs: "stretch", md: "center" } }}
            >
              {MESSAGES.ACCOUNTS.CREATE_BUTTON}
            </Button>
          </Box>
        </Card>
      </Box>

      {listError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetchList()}>
              {MESSAGES.ACCOUNTS.RETRY}
            </Button>
          }
        >
          {MESSAGES.ACCOUNTS.LIST_LOAD_ERROR}
        </Alert>
      ) : (
        <Card hover={false}>
          <AccountsTable />
        </Card>
      )}
    </Box>
  );
}
