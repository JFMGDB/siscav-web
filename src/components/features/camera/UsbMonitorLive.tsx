'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

type Status = 'starting' | 'live' | 'error';

export type UsbMonitorLiveProps = {
    preferredDeviceId?: string;
    minHeight?: number;
    maxVideoHeight?: number;
    borderRadius?: number;
};

/**
 * Inicia automaticamente getUserMedia para o monitor, usando deviceId guardado quando ainda válido.
 */
export default function UsbMonitorLive({
    preferredDeviceId,
    minHeight = 360,
    maxVideoHeight = 520,
    borderRadius = 2,
}: UsbMonitorLiveProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [status, setStatus] = useState<Status>('starting');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const stopStream = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const v = videoRef.current;
        if (v) v.srcObject = null;
    }, []);

    useEffect(() => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setErrorMessage('Este browser não suporta acesso à câmara.');
            setStatus('error');
            return;
        }

        let cancelled = false;

        const start = async () => {
            setStatus('starting');
            setErrorMessage(null);
            stopStream();

            const tryExact = async (id: string) => {
                return navigator.mediaDevices.getUserMedia({
                    video: { deviceId: { exact: id } },
                    audio: false,
                });
            };

            const tryDefault = async () => {
                return navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });
            };

            try {
                let stream: MediaStream;
                if (preferredDeviceId) {
                    try {
                        stream = await tryExact(preferredDeviceId);
                    } catch {
                        stream = await tryDefault();
                    }
                } else {
                    stream = await tryDefault();
                }

                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }

                streamRef.current = stream;
                const v = videoRef.current;
                if (v) {
                    v.srcObject = stream;
                    await v.play().catch(() => {});
                }
                setStatus('live');
            } catch (e) {
                if (cancelled) return;
                setStatus('error');
                if (e instanceof DOMException && e.name === 'NotAllowedError') {
                    setErrorMessage(
                        'Permissão negada para a câmara. Abra Pré-visualização e permita o acesso.',
                    );
                } else {
                    setErrorMessage('Não foi possível iniciar a câmara USB no monitor.');
                }
            }
        };

        void start();

        return () => {
            cancelled = true;
            stopStream();
        };
    }, [preferredDeviceId, stopStream]);

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                minHeight,
                bgcolor: '#0f172a',
                borderRadius,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                    width: '100%',
                    maxHeight: maxVideoHeight,
                    objectFit: 'contain',
                }}
            />
            {status === 'starting' && (
                <Typography
                    variant="body2"
                    sx={{ position: 'absolute', color: 'rgba(255,255,255,0.7)' }}
                >
                    A iniciar câmara…
                </Typography>
            )}
            {status === 'error' && errorMessage && (
                <Typography
                    variant="body2"
                    sx={{
                        position: 'absolute',
                        color: 'error.light',
                        px: 2,
                        textAlign: 'center',
                    }}
                >
                    {errorMessage}
                </Typography>
            )}
        </Box>
    );
}
