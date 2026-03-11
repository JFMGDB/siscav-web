'use client';

/**
 * Camera Feed Moderno
 * 
 * Refatoração com design moderno:
 * - Visual mais profissional
 * - Melhor feedback visual
 * - Design instrucional
 * 
 * Decisões:
 * - Mantém funcionalidade existente
 * - Melhora UX com visual mais limpo
 */

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Videocam as VideocamIcon, FiberManualRecord as RecordIcon } from '@mui/icons-material';
import { Card } from '@/components/ui/Card';

export default function CameraFeed() {
    return (
        <Card
            sx={{
                position: 'relative',
                width: '100%',
                minHeight: 500,
                bgcolor: '#000',
                p: 0,
                overflow: 'hidden',
                '&:hover': {
                    transform: 'none',
                },
            }}
        >
            {/* Live Badge */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 10,
                    display: 'flex',
                    gap: 1,
                }}
            >
                <Chip
                    icon={<RecordIcon sx={{ color: '#ef4444 !important', fontSize: '12px !important' }} />}
                    label="AO VIVO"
                    sx={{
                        bgcolor: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                            '0%': { opacity: 1 },
                            '50%': { opacity: 0.7 },
                            '100%': { opacity: 1 },
                        },
                    }}
                />
                <Chip
                    icon={<VideocamIcon sx={{ color: 'white !important' }} />}
                    label="Câmera 01"
                    sx={{
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                    }}
                />
            </Box>

            {/* Video Placeholder */}
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    minHeight: 500,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                    position: 'relative',
                }}
            >
                <Box
                    sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        border: '4px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                    }}
                >
                    <VideocamIcon sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.3)' }} />
                </Box>
                <Typography variant="h5" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1, fontWeight: 600 }}>
                    Feed da Câmera
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Transmissão ao vivo do ponto de acesso
                </Typography>

                {/* Grid overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px',
                        pointerEvents: 'none',
                    }}
                />
            </Box>
        </Card>
    );
}
