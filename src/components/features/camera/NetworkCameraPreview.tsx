'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { validateCameraPreviewUrl } from '@/lib/camera/validate-camera-url';

function HlsPreview({ src, onFatal }: { src: string; onFatal: (msg: string) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const onFatalRef = useRef(onFatal);
    onFatalRef.current = onFatal;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let cancelled = false;
        let hls: import('hls.js').default | null = null;

        (async () => {
            try {
                const { default: Hls } = await import('hls.js');
                if (cancelled || !videoRef.current) return;
                if (Hls.isSupported()) {
                    hls = new Hls();
                    hls.on(Hls.Events.ERROR, (_, data) => {
                        if (data.fatal) {
                            onFatalRef.current('Erro ao reproduzir o stream HLS.');
                        }
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    await video.play().catch(() => {});
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    await video.play().catch(() => {});
                } else {
                    onFatalRef.current('HLS não é suportado neste browser.');
                }
            } catch {
                onFatalRef.current('Não foi possível carregar o leitor HLS.');
            }
        })();

        return () => {
            cancelled = true;
            hls?.destroy();
            video.pause();
            video.removeAttribute('src');
            video.load();
        };
    }, [src]);

    return (
        <video
            ref={videoRef}
            controls
            playsInline
            muted
            style={{ width: '100%', maxHeight: 520, objectFit: 'contain' }}
        />
    );
}

export default function NetworkCameraPreview() {
    const [urlInput, setUrlInput] = useState('');
    const [active, setActive] = useState<{ href: string; isHls: boolean } | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [mediaError, setMediaError] = useState<string | null>(null);
    const [imgLoading, setImgLoading] = useState(false);

    const pageIsHttps =
        typeof window !== 'undefined' && window.location.protocol === 'https:';

    const handleConnect = () => {
        setMediaError(null);
        const result = validateCameraPreviewUrl(urlInput, { pageIsHttps });
        if (!result.ok) {
            setValidationError(result.message);
            setActive(null);
            return;
        }
        setValidationError(null);
        setImgLoading(!result.isHls);
        setActive({ href: result.href, isHls: result.isHls });
    };

    const handleDisconnect = () => {
        setActive(null);
        setMediaError(null);
        setImgLoading(false);
        setValidationError(null);
    };

    const handleHlsFatal = useCallback((msg: string) => {
        setMediaError(msg);
    }, []);

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
                <Stack direction="row" spacing={1}>
                    <Button variant="contained" onClick={handleConnect}>
                        Ligar
                    </Button>
                    <Button variant="outlined" onClick={handleDisconnect} disabled={!active}>
                        Desligar
                    </Button>
                </Stack>
            </Stack>

            <Typography variant="body2" color="text.secondary">
                MJPEG ou imagem contínua: use uma URL que funcione em &lt;img&gt;. HLS: URL com
                .m3u8 (Chrome/Firefox via hls.js; Safari pode usar reprodução nativa).
            </Typography>

            {validationError && <Alert severity="warning">{validationError}</Alert>}
            {mediaError && <Alert severity="error">{mediaError}</Alert>}

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
                {!active && (
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', px: 2 }}>
                        Indique a URL e prima Ligar
                    </Typography>
                )}

                {active && active.isHls && !mediaError && (
                    <HlsPreview src={active.href} onFatal={handleHlsFatal} />
                )}

                {active && !active.isHls && (
                    <>
                        {imgLoading && (
                            <Typography
                                variant="body2"
                                sx={{
                                    position: 'absolute',
                                    color: 'rgba(255,255,255,0.7)',
                                    zIndex: 1,
                                }}
                            >
                                A carregar…
                            </Typography>
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element -- MJPEG streams require native img */}
                        <img
                            src={active.href}
                            alt="Pré-visualização da câmara na rede"
                            style={{
                                width: '100%',
                                maxHeight: 520,
                                objectFit: 'contain',
                                display: mediaError ? 'none' : 'block',
                            }}
                            onLoad={() => {
                                setImgLoading(false);
                                setMediaError(null);
                            }}
                            onError={() => {
                                setImgLoading(false);
                                setMediaError(
                                    'Não foi possível carregar a imagem/stream. Verifique a URL, CORS ou rede.',
                                );
                            }}
                        />
                    </>
                )}
            </Box>
        </Stack>
    );
}
