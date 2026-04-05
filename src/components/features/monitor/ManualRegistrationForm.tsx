'use client';

import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Box,
    InputAdornment,
    Stack,
    Chip,
    Typography,
} from '@mui/material';
import {
    Save as SaveIcon,
    DirectionsCar as CarIcon,
    Description as DescriptionIcon,
    DocumentScanner as OcrIcon,
} from '@mui/icons-material';
import { apiClient } from '@/lib/api-client';
import { useSnackbar } from '@/hooks/use-snackbar';
import { Card } from '@/components/ui/Card';
import { useMonitorFrameCapture } from '@/contexts/monitor-frame-capture-context';
import type { PlateCandidate } from '@/types';

interface ManualRegistrationFormProps {
    initialPlate?: string;
    onSuccess?: () => void;
}

export default function ManualRegistrationForm({ initialPlate, onSuccess }: ManualRegistrationFormProps) {
    const [plate, setPlate] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [ocrBusy, setOcrBusy] = useState(false);
    const [candidates, setCandidates] = useState<PlateCandidate[]>([]);
    const { showMessage } = useSnackbar();
    const { captureFrame } = useMonitorFrameCapture();

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
            setCandidates([]);
            if (onSuccess) onSuccess();
        } catch {
            showMessage('Erro ao cadastrar veículo.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleServerOcr = async () => {
        setOcrBusy(true);
        setCandidates([]);
        try {
            const blob = await captureFrame();
            if (!blob) {
                showMessage(
                    'Não foi possível capturar o frame do vídeo. Configure a câmara e aguarde o stream ao vivo.',
                    'warning',
                );
                return;
            }
            const res = await apiClient.recognizePlate(blob, 'monitor-frame.jpg');
            setCandidates(res.candidates);
            if (res.candidates.length === 0) {
                showMessage('Nenhuma placa detectada neste frame.', 'info');
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Erro ao chamar o OCR no servidor.';
            const lower = msg.toLowerCase();
            if (lower.includes('503') || lower.includes('ml') || lower.includes('unavailable')) {
                showMessage(
                    'OCR indisponível no servidor. Instale as dependências ML (requirements-ml.txt) na API.',
                    'error',
                );
            } else if (lower.includes('413')) {
                showMessage('Imagem demasiado grande para o servidor.', 'error');
            } else {
                showMessage(msg, 'error');
            }
        } finally {
            setOcrBusy(false);
        }
    };

    const applyCandidate = (c: PlateCandidate) => {
        setPlate(c.normalized_plate || c.plate_raw);
        showMessage(`Placa "${c.normalized_plate}" selecionada.`, 'success');
    };

    return (
        <>
            <Card
                title="Cadastro Rápido"
                subtitle="Cadastre veículos visitantes ou não reconhecidos para liberar o acesso imediato"
            >
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Button
                            type="button"
                            variant="outlined"
                            color="secondary"
                            startIcon={<OcrIcon />}
                            onClick={() => void handleServerOcr()}
                            disabled={ocrBusy || loading}
                            fullWidth
                            sx={{ flex: '1 1 100%' }}
                        >
                            {ocrBusy ? 'A processar OCR…' : 'Ler placa (OCR no servidor)'}
                        </Button>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" display="block">
                        Captura um frame do vídeo ao vivo e envia para{' '}
                        <code style={{ fontSize: '0.75rem' }}>POST /api/v1/ml/recognize-plate</code> com o seu JWT.
                    </Typography>

                    {candidates.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Candidatos (toque para usar)
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
                                {candidates.map((c, i) => (
                                    <Chip
                                        key={`${c.normalized_plate}-${i}`}
                                        label={`${c.normalized_plate} · ${c.plate_color_hint}`}
                                        onClick={() => applyCandidate(c)}
                                        color="primary"
                                        variant="outlined"
                                    />
                                ))}
                            </Stack>
                        </Box>
                    )}

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
