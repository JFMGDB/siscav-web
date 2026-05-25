'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from '@mui/material';
import { useCameraConfig } from '@/hooks/use-camera-config';

type UsbStatus = 'idle' | 'starting' | 'live' | 'error';

export default function UsbCameraPreview() {
    const { config, setConfig } = useCameraConfig();
    const [saveHint, setSaveHint] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [status, setStatus] = useState<UsbStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [deviceId, setDeviceId] = useState<string>('');

    const stopStream = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const v = videoRef.current;
        if (v) {
            v.srcObject = null;
        }
    }, []);

    useEffect(() => () => stopStream(), [stopStream]);

    const attachStream = useCallback(async (stream: MediaStream) => {
        streamRef.current = stream;
        const v = videoRef.current;
        if (v) {
            v.srcObject = stream;
            await v.play().catch(() => {});
        }
    }, []);

    const handleStart = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setErrorMessage('Este browser não suporta acesso à câmara (getUserMedia).');
            setStatus('error');
            return;
        }
        setErrorMessage(null);
        setStatus('starting');
        stopStream();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });
            await attachStream(stream);
            const list = await navigator.mediaDevices.enumerateDevices();
            const videos = list.filter((d) => d.kind === 'videoinput');
            setDevices(videos);
            const trackId = stream.getVideoTracks()[0]?.getSettings().deviceId;
            setDeviceId(trackId || videos[0]?.deviceId || '');
            setStatus('live');
        } catch (e) {
            setStatus('error');
            if (e instanceof DOMException && e.name === 'NotAllowedError') {
                setErrorMessage(
                    'Permissão negada. Permita o acesso à câmara nas definições do browser.',
                );
            } else {
                setErrorMessage('Não foi possível iniciar a câmara USB.');
            }
        }
    };

    const handleStop = () => {
        stopStream();
        setStatus('idle');
        setDevices([]);
        setDeviceId('');
        setErrorMessage(null);
        setSaveHint(null);
    };

    const handleSaveConfig = () => {
        setSaveHint(null);
        if (status !== 'live' || !deviceId) {
            setErrorMessage('Ligue primeiro a câmara para guardar o dispositivo.');
            return;
        }
        setErrorMessage(null);
        setConfig({
            version: 1,
            source: 'usb',
            networkUrl: config.networkUrl,
            usbDeviceId: deviceId,
        });
        setSaveHint('Configuração guardada. O monitor usará esta câmara USB.');
    };

    const handleDeviceChange = async (newId: string) => {
        setDeviceId(newId);
        if (status !== 'live' || !newId) return;
        stopStream();
        setErrorMessage(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: newId } },
                audio: false,
            });
            await attachStream(stream);
        } catch {
            setStatus('error');
            setErrorMessage('Não foi possível mudar para a câmara selecionada.');
        }
    };

    const isLive = status === 'live';

    return (
        <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} flexWrap="wrap" useFlexGap>
                <Button
                    variant="contained"
                    onClick={isLive ? handleStop : handleStart}
                    disabled={status === 'starting'}
                >
                    {isLive ? 'Parar' : 'Ligar câmara'}
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSaveConfig}
                    disabled={status !== 'live' || !deviceId}
                >
                    Guardar configuração
                </Button>
                <FormControl sx={{ minWidth: 220 }} size="small" disabled={!devices.length}>
                    <InputLabel id="usb-camera-select-label">Câmara</InputLabel>
                    <Select
                        labelId="usb-camera-select-label"
                        label="Câmara"
                        value={deviceId || ''}
                        onChange={(e) => handleDeviceChange(e.target.value)}
                    >
                        {devices.map((d) => (
                            <MenuItem key={d.deviceId} value={d.deviceId}>
                                {d.label || `Câmara ${d.deviceId.slice(0, 8)}…`}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            {status === 'idle' && (
                <Typography variant="body2" color="text.secondary">
                    Prima &quot;Ligar câmara&quot; para pedir permissão e ver o vídeo do dispositivo USB
                    (requer HTTPS ou localhost). Depois use <strong>Guardar configuração</strong> para o
                    monitor mostrar o mesmo feed.
                </Typography>
            )}

            {status === 'starting' && (
                <Typography variant="body2" color="text.secondary">
                    A iniciar…
                </Typography>
            )}

            {saveHint && <Alert severity="success">{saveHint}</Alert>}

            {errorMessage && (
                <Alert severity="error" onClose={() => setErrorMessage(null)}>
                    {errorMessage}
                </Alert>
            )}

            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    minHeight: 360,
                    bgcolor: '#0f172a',
                    borderRadius: 2,
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
                        height: '100%',
                        maxHeight: 520,
                        objectFit: 'contain',
                    }}
                />
                {status === 'idle' && (
                    <Typography
                        variant="body2"
                        sx={{ position: 'absolute', color: 'rgba(255,255,255,0.6)' }}
                    >
                        Sem pré-visualização
                    </Typography>
                )}
            </Box>
        </Stack>
    );
}
