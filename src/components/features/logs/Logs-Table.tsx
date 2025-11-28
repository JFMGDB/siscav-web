'use client';

import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Typography,
    Box,
    Button,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { apiClient, AccessLog } from '@/lib/api-client';

export default function LogsTable() {
    const [logs, setLogs] = useState<AccessLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await apiClient.getLogs();
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">Histórico de Acesso</Typography>
                <Button startIcon={<RefreshIcon />} onClick={fetchLogs}>
                    Atualizar
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Data/Hora</TableCell>
                            <TableCell>Placa</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Imagem</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">Carregando...</TableCell>
                            </TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">Nenhum registro encontrado.</TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>{new Date(log.timestamp).toLocaleString('pt-BR')}</TableCell>
                                    <TableCell>{log.plate}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={log.status === 'AUTHORIZED' ? 'AUTORIZADO' : 'NEGADO'}
                                            color={log.status === 'AUTHORIZED' ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {log.imageUrl && (
                                            <Button size="small" variant="outlined">Ver Imagem</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
