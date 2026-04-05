'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { imageElementToJpegBlob, videoToJpegBlob } from '@/lib/camera/capture-frame';
import type { MonitorFrameCaptureFn } from '@/contexts/monitor-frame-capture-context';

function HlsPreview({
    src,
    onFatal,
    videoRef,
}: {
    src: string;
    onFatal: (msg: string) => void;
    videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
    const onFatalRef = useRef(onFatal);
    onFatalRef.current = onFatal;

    useEffect(() => {
        let cancelled = false;
        let hls: import('hls.js').default | null = null;

        const setup = async () => {
            await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
            const video = videoRef.current;
            if (!video || cancelled) return;

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
        };

        void setup();

        return () => {
            cancelled = true;
            hls?.destroy();
            const video = videoRef.current;
            if (video) {
                video.pause();
                video.removeAttribute('src');
                video.load();
            }
        };
    }, [src]); // videoRef object is stable; src drives reload

    return (
        <video
            ref={videoRef}
            controls
            playsInline
            muted
            style={{ width: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
    );
}

export type NetworkStreamSurfaceProps = {
    href: string;
    isHls: boolean;
    minHeight?: number;
    maxVideoHeight?: number;
    borderRadius?: number;
    emptyLabel?: string;
    /** Registo de captura de frame para OCR no monitor (MJPEG → img, HLS → video). */
    registerFrameCapture?: (fn: MonitorFrameCaptureFn | null) => void;
};

/**
 * Área de vídeo/imagem para stream de rede (MJPEG ou HLS), reutilizável no monitor e na página de configuração.
 */
export default function NetworkStreamSurface({
    href,
    isHls,
    minHeight = 360,
    maxVideoHeight = 520,
    borderRadius = 2,
    emptyLabel = 'Sem stream',
    registerFrameCapture,
}: NetworkStreamSurfaceProps) {
    const [mediaError, setMediaError] = useState<string | null>(null);
    const [imgLoading, setImgLoading] = useState(!isHls);
    const hlsVideoRef = useRef<HTMLVideoElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const handleHlsFatal = useCallback((msg: string) => {
        setMediaError(msg);
    }, []);

    useEffect(() => {
        setMediaError(null);
        setImgLoading(!isHls);
    }, [href, isHls]);

    useEffect(() => {
        if (!registerFrameCapture) return;

        const fn: MonitorFrameCaptureFn = async () => {
            if (!href) return null;
            if (isHls) {
                const v = hlsVideoRef.current;
                if (v?.videoWidth) return videoToJpegBlob(v);
                return null;
            }
            const img = imgRef.current;
            if (img?.naturalWidth) return imageElementToJpegBlob(img);
            return null;
        };

        registerFrameCapture(fn);
        return () => registerFrameCapture(null);
    }, [registerFrameCapture, href, isHls, mediaError]);

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                minHeight,
                maxHeight: maxVideoHeight + 40,
                bgcolor: '#0f172a',
                borderRadius,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {!href && (
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', px: 2 }}>
                    {emptyLabel}
                </Typography>
            )}

            {href && isHls && !mediaError && (
                <HlsPreview src={href} onFatal={handleHlsFatal} videoRef={hlsVideoRef} />
            )}

            {href && !isHls && (
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
                        ref={imgRef}
                        src={href}
                        alt="Stream da câmara na rede"
                        style={{
                            width: '100%',
                            maxHeight: maxVideoHeight,
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
                                'Não foi possível carregar o stream. Verifique a URL, CORS ou rede.',
                            );
                        }}
                    />
                </>
            )}

            {mediaError && (
                <Typography variant="body2" sx={{ color: 'error.light', px: 2, textAlign: 'center' }}>
                    {mediaError}
                </Typography>
            )}
        </Box>
    );
}
