'use client';

import React, { useEffect, useState } from 'react';
import {
    Alert,
    Button,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { validateCameraPreviewUrl } from '@/lib/camera/validate-camera-url';
import { useCameraConfig } from '@/hooks/use-camera-config';
import NetworkStreamSurface from '@/components/features/camera/NetworkStreamSurface';

export default function NetworkCameraPreview() {
    const { config, setConfig } = useCameraConfig();
    const [urlInput, setUrlInput] = useState(config.networkUrl);
    const [active, setActive] = useState<{ href: string; isHls: boolean } | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);

    const pageIsHttps =
        typeof window !== 'undefined' && window.location.protocol === 'https:';

    useEffect(() => {
        setUrlInput(config.networkUrl);
    }, [config.networkUrl]);

    const handleConnect = () => {
        setSaveHint(null);
        const result = validateCameraPreviewUrl(urlInput, { pageIsHttps });
        if (!result.ok) {
            setValidationError(result.message);
            setActive(null);
            return;
        }
        setValidationError(null);
        setActive({ href: result.href, isHls: result.isHls });
    };

    const handleDisconnect = () => {
        setActive(null);
        setValidationError(null);
    };

    const handleSaveConfig = () => {
        setSaveHint(null);
        const trimmed = urlInput.trim();
        if (!trimmed) {
            setValidationError('Indique uma URL para guardar o modo rede.');
            return;
        }
        const result = validateCameraPreviewUrl(trimmed, { pageIsHttps });
        if (!result.ok) {
            setValidationError(result.message);
            return;
        }
        setValidationError(null);
        setConfig({
            version: 1,
            source: 'network',
            networkUrl: trimmed,
            usbDeviceId: config.usbDeviceId,
        });
        setSaveHint('Configuração guardada. O monitor usará esta URL.');
        setActive({ href: result.href, isHls: result.isHls });
    };

    return (
        <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
                <TextField
                    label="URL do stream"
                    placeholder="https://… ou http://… (rede local)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    fullWidth
                    size="small"
                />
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button variant="contained" onClick={handleConnect}>
                        Ligar
                    </Button>
                    <Button variant="outlined" onClick={handleDisconnect} disabled={!active}>
                        Desligar
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleSaveConfig}>
                        Guardar configuração
                    </Button>
                </Stack>
            </Stack>

            <Typography variant="body2" color="text.secondary">
                MJPEG ou imagem contínua: use uma URL que funcione em &lt;img&gt;. HLS: URL com
                .m3u8 (Chrome/Firefox via hls.js; Safari pode usar reprodução nativa). Prima{' '}
                <strong>Guardar configuração</strong> para o monitor mostrar o mesmo stream.
            </Typography>

            {validationError && <Alert severity="warning">{validationError}</Alert>}
            {saveHint && <Alert severity="success">{saveHint}</Alert>}

            <NetworkStreamSurface
                href={active?.href ?? ''}
                isHls={active?.isHls ?? false}
                minHeight={360}
                maxVideoHeight={520}
                emptyLabel="Indique a URL e prima Ligar ou Guardar configuração"
            />
        </Stack>
    );
}
