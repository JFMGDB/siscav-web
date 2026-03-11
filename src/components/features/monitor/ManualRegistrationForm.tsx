'use client';

/**
 * Manual Registration Form Moderno
 * 
 * Refatoração com design moderno:
 * - Visual mais limpo
 * - Melhor feedback visual
 * - Design instrucional
 * 
 * Decisões:
 * - Mantém funcionalidade existente
 * - Melhora UX com visual mais limpo
 */

import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button, Box, InputAdornment } from '@mui/material';
import { Save as SaveIcon, DirectionsCar as CarIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { apiClient } from '@/lib/api-client';
import { useSnackbar } from '@/hooks/use-snackbar';
import { Card } from '@/components/ui/Card';

interface ManualRegistrationFormProps {
    initialPlate?: string;
    onSuccess?: () => void;
}

export default function ManualRegistrationForm({ initialPlate, onSuccess }: ManualRegistrationFormProps) {
    const [plate, setPlate] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const { showMessage } = useSnackbar();

    useEffect(() => {
        if (initialPlate) {
            setPlate(initialPlate);
        }
    }, [initialPlate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!plate) return;

        setLoading(true);
        try {
            await apiClient.registerUnknownPlate(plate, description);
            showMessage('Veículo cadastrado e autorizado com sucesso!', 'success');
            setPlate('');
            setDescription('');
            if (onSuccess) onSuccess();
        } catch {
            showMessage('Erro ao cadastrar veículo.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card
                title="Cadastro Rápido"
                subtitle="Cadastre veículos visitantes ou não reconhecidos para liberar o acesso imediato"
            >
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                        label="Placa do Veículo"
                        value={plate}
                        onChange={(e) => {
                            const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                            setPlate(value);
                        }}
                        required
                        fullWidth
                        placeholder="ABC-1234"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <CarIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontFamily: 'monospace',
                                fontSize: '1.125rem',
                                fontWeight: 600,
                            },
                        }}
                    />

                    <TextField
                        label="Descrição / Proprietário"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        placeholder="Ex: Visitante Apto 101, Funcionário, etc."
                        multiline
                        rows={3}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                                    <DescriptionIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={loading ? null : <SaveIcon />}
                        disabled={loading || !plate}
                        fullWidth
                        sx={{
                            mt: 1,
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                            boxShadow: '0 4px 15px -3px rgba(37, 99, 235, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                                boxShadow: '0 6px 20px -3px rgba(37, 99, 235, 0.5)',
                                transform: 'translateY(-1px)',
                            },
                            '&:active': {
                                transform: 'translateY(0)',
                            },
                        }}
                    >
                        {loading ? 'Salvando...' : 'Autorizar Acesso'}
                    </Button>
                </Box>
            </Card>
        </>
    );
}
