"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import type { AccountUser } from "@/types/accounts";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import { MESSAGES } from "@/constants";

function roleLabel(user: AccountUser): string {
  if (user.is_superadmin) return MESSAGES.ACCOUNTS.ROLE_SUPERADMIN_SHORT;
  if (user.is_admin) return MESSAGES.ACCOUNTS.ROLE_CLIENT_ADMIN;
  return "Usuário";
}

function roleColor(
  user: AccountUser,
): "primary" | "secondary" | "default" {
  if (user.is_superadmin) return "secondary";
  if (user.is_admin) return "primary";
  return "default";
}

export default function AccountsTable() {
  const { user: currentUser } = useAuth();
  const {
    accounts,
    listLoading,
    updateAccount,
    deleteAccount,
    isUpdating,
    isDeleting,
  } = useUsers();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [selected, setSelected] = useState<AccountUser | null>(null);

  const handleOpenEdit = (account: AccountUser) => {
    setSelected(account);
    setEditEmail(account.email);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelected(null);
    setEditEmail("");
  };

  const handleOpenDelete = (account: AccountUser) => {
    setSelected(account);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteOpen(false);
    setSelected(null);
  };

  const handleSave = async () => {
    if (!selected || !editEmail.trim()) return;
    try {
      await updateAccount({
        id: selected.id,
        payload: { email: editEmail.trim() },
      });
      handleCloseEdit();
    } catch {
      // snackbar handled by hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      await deleteAccount(selected.id);
      handleCloseDelete();
    } catch {
      // snackbar handled by hook
    }
  };

  const canDelete = (account: AccountUser) =>
    !account.is_superadmin && account.id !== currentUser?.id;

  const canEdit = (account: AccountUser) => !account.is_superadmin;

  const columns: Column<AccountUser>[] = [
    {
      columnType: "field",
      id: "email",
      label: "E-mail",
      format: (value) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon sx={{ fontSize: 20, color: "primary.main" }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      columnType: "field",
      id: "is_admin",
      label: "Papel",
      format: (_, row) => (
        <Chip
          label={roleLabel(row)}
          color={roleColor(row)}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      columnType: "field",
      id: "created_at",
      label: "Criado em",
      hideBelow: "sm",
      format: (value) =>
        new Date(value as string).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      columnType: "actions",
      id: "actions",
      label: "Ações",
      align: "right",
      format: (row) => (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          {canEdit(row) && (
            <IconButton
              size="small"
              aria-label={MESSAGES.ACCOUNTS.EDIT_EMAIL}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(row);
              }}
              sx={{
                color: "primary.main",
                "&:hover": { backgroundColor: "rgba(13, 148, 136, 0.1)" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {canDelete(row) && (
            <IconButton
              size="small"
              aria-label="Excluir conta"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDelete(row);
              }}
              sx={{
                color: "error.main",
                "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.1)" },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        {MESSAGES.ACCOUNTS.TABLE_TITLE}
      </Typography>
      <DataTable
        columns={columns}
        rows={accounts}
        loading={listLoading}
        emptyMessage={MESSAGES.ACCOUNTS.EMPTY}
      />

      <Dialog open={editOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {MESSAGES.ACCOUNTS.EDIT_EMAIL}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="E-mail"
            type="email"
            fullWidth
            margin="normal"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseEdit} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={isUpdating || !editEmail.trim()}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Excluir conta</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {MESSAGES.ACCOUNTS.DELETE_CONFIRM}
          </Typography>
          {selected && (
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
              {selected.email}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDelete} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleConfirmDelete()}
            disabled={isDeleting}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
