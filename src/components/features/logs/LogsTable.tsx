"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Chip,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogContent,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import type { AccessLog, AccessLogFilters, PaginatedResponse } from "@/types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { resolveApiError } from "@/lib/api/errors";
import { getClientApiClient } from "@/lib/api/client";
import * as logsApi from "@/lib/api/logs";
import { useLogs } from "@/hooks/use-logs";
import { MESSAGES } from "@/constants";

interface LogsTableProps {
  initialData?: PaginatedResponse<AccessLog>;
}

type LogStatusFilter = "ALL" | "Authorized" | "Denied";

function parseLogStatusFilter(value: string): LogStatusFilter {
  if (value === "ALL" || value === "Authorized" || value === "Denied")
    return value;
  return "ALL";
}

export default function LogsTable({ initialData }: LogsTableProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LogStatusFilter>("ALL");
  const [selectedImageKey, setSelectedImageKey] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const filters: AccessLogFilters = useMemo(() => {
    const f: AccessLogFilters = { skip: 0, limit: 100 };
    if (statusFilter !== "ALL") f.status = statusFilter;
    if (searchTerm) f.plate = searchTerm;
    return f;
  }, [statusFilter, searchTerm]);

  const { logs, loading, error, refetch } = useLogs(filters, initialData);

  useEffect(() => {
    if (!selectedImageKey) return;

    let cancelled = false;

    const loadImage = async () => {
      setImageLoading(true);
      setImageError(null);
      setSelectedImageUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      try {
        const blob = await logsApi.fetchAccessLogImage(
          getClientApiClient(),
          selectedImageKey,
        );
        if (cancelled) return;
        setSelectedImageUrl(URL.createObjectURL(blob));
      } catch (e) {
        if (cancelled) return;
        setImageError(
          resolveApiError(e, "Não foi possível carregar a imagem."),
        );
      } finally {
        if (!cancelled) setImageLoading(false);
      }
    };

    void loadImage();

    return () => {
      cancelled = true;
    };
  }, [selectedImageKey]);

  const closeImageDialog = () => {
    if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);
    setSelectedImageKey(null);
    setSelectedImageUrl(null);
    setImageError(null);
    setImageLoading(false);
  };

  const columns: Column<AccessLog>[] = [
    {
      columnType: "field",
      id: "timestamp",
      label: "Data/Hora",
      format: (value) => (
        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
          {new Date(value as string).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </Typography>
      ),
    },
    {
      columnType: "field",
      id: "plate_string_detected",
      label: "Placa",
      format: (value) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, fontFamily: "monospace" }}
        >
          {value}
        </Typography>
      ),
    },
    {
      columnType: "field",
      id: "status",
      label: "Status",
      align: "center",
      format: (value) => <StatusChip status={value as AccessLog["status"]} />,
    },
    {
      columnType: "field",
      id: "image_storage_key",
      label: "Imagem",
      align: "center",
      format: (value) =>
        value ? (
          <Button
            size="small"
            variant="outlined"
            startIcon={<ImageIcon />}
            onClick={() => setSelectedImageKey(value as string)}
            sx={{
              textTransform: "none",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "white",
                borderColor: "primary.main",
              },
            }}
          >
            Ver Imagem
          </Button>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            N/A
          </Typography>
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
              Histórico de Acesso
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visualize todos os registros de tentativas de acesso ao sistema
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={loading}
            sx={{
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Atualizar
          </Button>
        </Box>

        {error ? (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Typography
                component="button"
                type="button"
                onClick={() => void refetch()}
                sx={{
                  border: 0,
                  background: "none",
                  cursor: "pointer",
                  color: "inherit",
                  fontWeight: 600,
                }}
              >
                {MESSAGES.COMMON.RETRY}
              </Typography>
            }
          >
            {resolveApiError(error, MESSAGES.COMMON.LOAD_ERROR)}
          </Alert>
        ) : null}

        {/* Filters */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              placeholder="Buscar por placa ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ flex: 1, minWidth: 250 }}
              size="small"
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select<LogStatusFilter>
                value={statusFilter}
                label="Status"
                onChange={(e: SelectChangeEvent<LogStatusFilter>) =>
                  setStatusFilter(parseLogStatusFilter(e.target.value))
                }
              >
                <MenuItem value="ALL">Todos</MenuItem>
                <MenuItem value="Authorized">Autorizados</MenuItem>
                <MenuItem value="Denied">Negados</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`Total: ${logs.length} registros`}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            </Box>
          </Box>
        </Card>

        {/* Table */}
        <DataTable
          columns={columns}
          rows={logs}
          loading={loading}
          emptyMessage="Nenhum registro de acesso encontrado."
        />
      </Box>

      {/* Image Modal */}
      <Dialog
        open={!!selectedImageKey}
        onClose={closeImageDialog}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: "relative", minHeight: 240 }}>
          <IconButton
            onClick={closeImageDialog}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1,
              bgcolor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.7)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {imageLoading && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 240,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          {imageError && !imageLoading && (
            <Alert severity="error" sx={{ m: 2 }}>
              {imageError}
            </Alert>
          )}
          {selectedImageUrl && !imageLoading && (
            <Box
              component="img"
              src={selectedImageUrl}
              alt="Imagem capturada"
              sx={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
