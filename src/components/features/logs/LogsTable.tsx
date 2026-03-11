'use client';

/**
 * Logs Table - uses useLogs (TanStack Query) with filters.
 */

import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Search as SearchIcon,
    Image as ImageIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import type { AccessLog, AccessLogFilters, PaginatedResponse } from '@/types';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { getAccessLogImageUrl } from '@/lib/image-url';
import { useLogs } from '@/hooks/use-logs';

interface LogsTableProps {
  initialData?: PaginatedResponse<AccessLog>;
}

export default function LogsTable({ initialData }: LogsTableProps = {}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'Authorized' | 'Denied'>('ALL');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const filters: AccessLogFilters = useMemo(() => {
        const f: AccessLogFilters = { skip: 0, limit: 100 };
        if (statusFilter !== 'ALL') f.status = statusFilter;
        if (searchTerm) f.plate = searchTerm;
        return f;
    }, [statusFilter, searchTerm]);

    const { logs, loading, refetch } = useLogs(filters, initialData);

    const columns: Column<AccessLog>[] = [
        {
            id: 'timestamp',
            label: 'Data/Hora',
            format: (value) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {new Date(value).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    })}
                </Typography>
            ),
        },
        {
            id: 'plate_string_detected',
            label: 'Placa',
            format: (value) => (
                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {value}
                </Typography>
            ),
        },
        {
            id: 'status',
            label: 'Status',
            align: 'center',
            format: (value) => <StatusChip status={value} />,
        },
        {
            id: 'image_storage_key',
            label: 'Imagem',
            align: 'center',
            format: (value, row) =>
                value ? (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ImageIcon />}
                        onClick={() => setSelectedImage(getAccessLogImageUrl(value))}
                        sx={{
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                borderColor: 'primary.main',
                            },
                        }}
                    >
                        Ver Imagem
                    </Button>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        N/A
                    </Typography>
                ),
        },
    ];

    return (
        <>
            <Box>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
                            textTransform: 'none',
                            fontWeight: 500,
                        }}
                    >
                        Atualizar
                    </Button>
                </Box>

                {/* Filters */}
                <Card sx={{ mb: 3, p: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            placeholder="Buscar por placa ou ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flex: 1, minWidth: 250 }}
                            size="small"
                        />
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                            >
                                <MenuItem value="ALL">Todos</MenuItem>
                                <MenuItem value="Authorized">Autorizados</MenuItem>
                                <MenuItem value="Denied">Negados</MenuItem>
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                open={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                    },
                }}
            >
                <DialogContent sx={{ p: 0, position: 'relative' }}>
                    <IconButton
                        onClick={() => setSelectedImage(null)}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1,
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    {selectedImage && (
                        <Box
                            component="img"
                            src={selectedImage}
                            alt="Imagem capturada"
                            sx={{
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
