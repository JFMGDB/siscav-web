'use client';

/**
 * Gate Control Moderno
 * 
 * Refatoração com design moderno:
 * - Visual mais impactante
 * - Melhor feedback visual
 * - Design instrucional
 * 
 * Decisões:
 * - Mantém funcionalidade existente
 * - Melhora UX com feedback visual melhor
 */

import React, { useState } from 'react';
import { Typography, Button, Box, CircularProgress } from '@mui/material';
import { LockOpen as LockOpenIcon } from '@mui/icons-material';
import { apiClient } from '@/lib/api-client';
import { useSnackbar } from '@/hooks/use-snackbar';
import { Card } from '@/components/ui/Card';
import { MESSAGES } from '@/constants';

export default function GateControl() {
    const [loading, setLoading] = useState(false);
    const { showMessage } = useSnackbar();

    const handleOpenGate = async () => {
        setLoading(true);
        try {
            await apiClient.openGate();
            showMessage(MESSAGES.GATE.OPEN_SUCCESS, 'success');
        } catch {
            showMessage(MESSAGES.GATE.OPEN_ERROR, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card
                title="Controle Remoto do Portão"
                subtitle="Abra o portão manualmente quando necessário"
                sx={{
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f59e0b15 0%, #f59e0b05 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                }}
            >
                <Box sx={{ py: 2 }}>
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 3,
                            boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4)',
                        }}
                    >
                        <LockOpenIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Use este botão para abrir o portão remotamente. O comando será enviado
                        imediatamente ao sistema.
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Button
                            variant="contained"
                            color="warning"
                            size="large"
                            startIcon={loading ? null : <LockOpenIcon />}
                            onClick={handleOpenGate}
                            disabled={loading}
                            sx={{
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                boxShadow: '0 4px 15px -3px rgba(245, 158, 11, 0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                                    boxShadow: '0 6px 20px -3px rgba(245, 158, 11, 0.5)',
                                    transform: 'translateY(-2px)',
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                },
                            }}
                        >
                            {loading ? 'Abrindo...' : 'Abrir Portão'}
                        </Button>
                        {loading && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px',
                                    color: 'white',
                                }}
                            />
                        )}
                    </Box>
                </Box>
            </Card>
        </>
    );
}
