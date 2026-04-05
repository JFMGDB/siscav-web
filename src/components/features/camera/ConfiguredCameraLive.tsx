'use client';

import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import { useCameraConfig } from '@/hooks/use-camera-config';
import { resolveNetworkStreamFromConfig } from '@/lib/camera/camera-config';
import NetworkStreamSurface from '@/components/features/camera/NetworkStreamSurface';
import UsbMonitorLive from '@/components/features/camera/UsbMonitorLive';
import { ROUTES } from '@/constants';

export type ConfiguredCameraLiveProps = {
    /** Altura mínima da área de vídeo (px). */
    minHeight?: number;
    maxVideoHeight?: number;
};

/**
 * Feed ao vivo conforme configuração persistida (USB ou URL de rede).
 */
export default function ConfiguredCameraLive({
    minHeight = 420,
    maxVideoHeight = 480,
}: ConfiguredCameraLiveProps) {
    const { config } = useCameraConfig();
    const pageIsHttps =
        typeof window !== 'undefined' && window.location.protocol === 'https:';

    const networkResolved =
        config.source === 'network'
            ? resolveNetworkStreamFromConfig(config.networkUrl, pageIsHttps)
            : null;

    const needsSetup =
        (config.source === 'usb' && !config.usbDeviceId.trim()) ||
        (config.source === 'network' && !config.networkUrl.trim());

    if (needsSetup) {
        return (
            <Box
                sx={{
                    minHeight,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    px: 2,
                    textAlign: 'center',
                }}
            >
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                    Ainda não há câmara configurada para o monitor.
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Em Pré-visualização, ligue a câmara ou a URL e prima{' '}
                    <strong>Guardar configuração</strong>.
                </Typography>
                <Button
                    component={Link}
                    href={ROUTES.AUTH.CAMERA}
                    variant="contained"
                    color="primary"
                    sx={{ mt: 1 }}
                >
                    Configurar câmara
                </Button>
            </Box>
        );
    }

    if (config.source === 'usb') {
        return (
            <UsbMonitorLive
                preferredDeviceId={config.usbDeviceId || undefined}
                minHeight={minHeight}
                maxVideoHeight={maxVideoHeight}
                borderRadius={0}
            />
        );
    }

    if (config.source === 'network' && networkResolved && !networkResolved.ok) {
        return (
            <Box
                sx={{
                    minHeight,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    px: 2,
                }}
            >
                <Typography variant="body2" sx={{ color: 'error.light', textAlign: 'center' }}>
                    {networkResolved.message}
                </Typography>
                <Button component={Link} href={ROUTES.AUTH.CAMERA} variant="outlined" color="inherit" size="small">
                    Corrigir em Pré-visualização
                </Button>
            </Box>
        );
    }

    if (config.source === 'network' && networkResolved?.ok) {
        return (
            <NetworkStreamSurface
                href={networkResolved.href}
                isHls={networkResolved.isHls}
                minHeight={minHeight}
                maxVideoHeight={maxVideoHeight}
                borderRadius={0}
            />
        );
    }

    return null;
}
