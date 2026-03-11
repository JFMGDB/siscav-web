'use client';

/**
 * Plate Recognition Display - uses useMonitorCapture (TanStack Query with polling).
 */

import React, { useEffect, useRef } from 'react';
import { Typography, Box, CircularProgress } from '@mui/material';
import { getAccessStatusColor } from '@/lib/access-status';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { useMonitorCapture } from '@/hooks/use-monitor-capture';

interface PlateRecognitionDisplayProps {
    onUnknownPlate: (plate: string) => void;
}

export default function PlateRecognitionDisplay({ onUnknownPlate }: PlateRecognitionDisplayProps) {
    const { capture } = useMonitorCapture();
    const lastCaptureIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (capture && capture.id !== lastCaptureIdRef.current && capture.status === 'Denied') {
            lastCaptureIdRef.current = capture.id;
            onUnknownPlate(capture.plate);
        } else if (capture) {
            lastCaptureIdRef.current = capture.id;
        }
    }, [capture, onUnknownPlate]);

    if (!capture) {
        return (
            <Card
                sx={{
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: 300,
                }}
            >
                <CircularProgress size={48} sx={{ mx: 'auto', mb: 2, color: 'primary.main' }} />
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Aguardando veículo...
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    O sistema está monitorando o ponto de acesso
                </Typography>
            </Card>
        );
    }

    const statusColor = getAccessStatusColor(capture.status);

    return (
        <Card
            title="Última Leitura"
            subtitle="Reconhecimento automático de placa em tempo real"
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                {/* Plate Display */}
                <Box
                    sx={{
                        border: '3px solid',
                        borderColor: `${statusColor}.main`,
                        borderRadius: 3,
                        p: 3,
                        bgcolor: `${statusColor}.50`,
                        mb: 3,
                        width: '100%',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(135deg, ${statusColor}.100 0%, transparent 100%)`,
                            opacity: 0.5,
                        },
                    }}
                >
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: 6,
                            fontFamily: 'monospace',
                            position: 'relative',
                            zIndex: 1,
                            color: `${statusColor}.main`,
                        }}
                    >
                        {capture.plate}
                    </Typography>
                </Box>

                {/* Status Chip */}
                <StatusChip
                    status={capture.status}
                    sx={{
                        fontSize: '1rem',
                        py: 2,
                        px: 3,
                        width: '100%',
                        mb: 2,
                    }}
                />

                {/* Metadata */}
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 2,
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Confiança
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {(capture.confidence * 100).toFixed(1)}%
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Timestamp
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                            {new Date(capture.timestamp).toLocaleTimeString('pt-BR')}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Card>
    );
}
