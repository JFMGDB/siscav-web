"use client";

/**
 * Whitelist Table - uses useWhitelist (TanStack Query) for data and mutations.
 */

import React, { useState } from "react";
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  DirectionsCar as CarIcon,
} from "@mui/icons-material";
import type { AuthorizedPlate, PaginatedResponse } from "@/types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useSnackbar } from "@/hooks/use-snackbar";
import { useWhitelist } from "@/hooks/use-whitelist";

interface WhitelistTableProps {
  initialData?: PaginatedResponse<AuthorizedPlate>;
}

export default function WhitelistTable({
  initialData,
}: WhitelistTableProps = {}) {
  const [open, setOpen] = useState(false);
  const [currentPlate, setCurrentPlate] = useState<Partial<AuthorizedPlate>>(
    {},
  );
  const { showMessage } = useSnackbar();
  const {
    plates,
    loading,
    addPlate,
    updatePlate,
    removePlate,
    isAdding,
    isUpdating,
  } = useWhitelist(initialData);

  const handleOpen = (plate?: AuthorizedPlate) => {
    if (plate) {
      setCurrentPlate(plate);
    } else {
      setCurrentPlate({});
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentPlate({});
  };

  const handleSave = async () => {
    if (!currentPlate.plate) {
      showMessage("Por favor, informe a placa do veículo", "warning");
      return;
    }
    try {
      if (currentPlate.id) {
        await updatePlate({
          id: currentPlate.id,
          plate: currentPlate.plate,
          description: currentPlate.description,
        });
      } else {
        await addPlate({
          plate: currentPlate.plate,
          description: currentPlate.description,
        });
      }
      handleClose();
    } catch {
      // Error message handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Tem certeza que deseja remover este veículo da lista de autorizados?",
      )
    ) {
      try {
        await removePlate(id);
      } catch {
        // Error message handled by hook
      }
    }
  };

  const columns: Column<AuthorizedPlate>[] = [
    {
      columnType: "field",
      id: "plate",
      label: "Placa",
      format: (value) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CarIcon sx={{ fontSize: 20, color: "primary.main" }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, fontFamily: "monospace" }}
          >
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      columnType: "field",
      id: "description",
      label: "Descrição",
      format: (value) =>
        value || (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            Sem descrição
          </Typography>
        ),
    },
    {
      columnType: "field",
      id: "created_at",
      label: "Criado em",
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
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpen(row);
            }}
            sx={{
              color: "primary.main",
              "&:hover": {
                backgroundColor: "rgba(37, 99, 235, 0.1)",
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            sx={{
              color: "error.main",
              "&:hover": {
                backgroundColor: "rgba(239, 68, 68, 0.1)",
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <>
      <Box>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Veículos Autorizados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie a lista de veículos com acesso autorizado ao sistema
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{
              background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
              boxShadow: "0 4px 15px -3px rgba(37, 99, 235, 0.4)",
              "&:hover": {
                boxShadow: "0 6px 20px -3px rgba(37, 99, 235, 0.5)",
                transform: "translateY(-1px)",
              },
            }}
          >
            Adicionar Veículo
          </Button>
        </Box>

        {/* Stats */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Chip
            label={`Total: ${plates.length} veículos`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Box>

        {/* Table */}
        <DataTable
          columns={columns}
          rows={plates}
          loading={loading}
          emptyMessage="Nenhum veículo autorizado encontrado. Adicione o primeiro veículo usando o botão acima."
        />
      </Box>

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {currentPlate.id ? "Editar Veículo" : "Adicionar Veículo"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              autoFocus
              label="Placa do Veículo"
              placeholder="ABC-1234"
              fullWidth
              value={currentPlate.plate || ""}
              onChange={(e) => {
                const value = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9-]/g, "");
                setCurrentPlate({ ...currentPlate, plate: value });
              }}
              helperText="Digite a placa no formato ABC-1234 ou ABC1234"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontFamily: "monospace",
                  fontSize: "1.125rem",
                  fontWeight: 600,
                },
              }}
            />
            <TextField
              label="Descrição (opcional)"
              placeholder="Ex: Veículo da empresa, Visitante, etc."
              fullWidth
              multiline
              rows={3}
              value={currentPlate.description || ""}
              onChange={(e) =>
                setCurrentPlate({
                  ...currentPlate,
                  description: e.target.value,
                })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleClose} sx={{ color: "text.secondary" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isAdding || isUpdating}
            sx={{
              background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
              },
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
