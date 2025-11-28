'use client';

import React, { useState } from 'react';
import { Paper, Typography, Button, Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import { LockOpen as LockOpenIcon } from '@mui/icons-material';
import { apiClient } from '@/lib/api-client';

export default function GateControl() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleOpenGate = async () => {
        setLoading(true);
        try {
            await apiClient.openGate();
            setMessage({ text: 'Comando de abertura enviado com sucesso', type: 'success' });
        } catch (error) {
            setMessage({ text: 'Falha ao abrir o portão', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" color="primary" gutterBottom>
                Controle Remoto
            </Typography>
            <Box sx={{ position: 'relative' }}>
                <Button
                    variant="contained"
                    color="warning"
                    size="large"
                    startIcon={<LockOpenIcon />}
                    onClick={handleOpenGate}
                    disabled={loading}
                    sx={{ mt: 2 }}
                >
                    Abrir Portão
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
                        }}
                    />
                )}
            </Box>
            <Snackbar
                open={!!message}
                autoHideDuration={6000}
                onClose={() => setMessage(null)}
            >
                <Alert onClose={() => setMessage(null)} severity={message?.type} sx={{ width: '100%' }}>
                    {message?.text}
                </Alert>
            </Snackbar>
        </Paper>
    );
}
