import {
    looksLikeHlsUrl,
    redactUrlForDisplay,
    validateCameraPreviewUrl,
} from '@/lib/camera/validate-camera-url';

describe('validateCameraPreviewUrl', () => {
    it('rejects empty', () => {
        const r = validateCameraPreviewUrl('', { pageIsHttps: false });
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.reason).toBe('empty');
    });

    it('accepts https when page is https', () => {
        const r = validateCameraPreviewUrl('https://cam.example/stream.mjpg', { pageIsHttps: true });
        expect(r.ok).toBe(true);
        if (r.ok) expect(r.isHls).toBe(false);
    });

    it('blocks http when page is https (mixed content)', () => {
        const r = validateCameraPreviewUrl('http://192.168.1.10/video.mjpg', { pageIsHttps: true });
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.reason).toBe('mixed_content');
    });

    it('allows http when page is not https', () => {
        const r = validateCameraPreviewUrl('http://192.168.1.10/video.mjpg', { pageIsHttps: false });
        expect(r.ok).toBe(true);
    });

    it('rejects javascript:', () => {
        const r = validateCameraPreviewUrl('javascript:alert(1)', { pageIsHttps: false });
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.reason).toBe('unsafe_scheme');
    });

    it('marks m3u8 as HLS', () => {
        const r = validateCameraPreviewUrl('https://example.com/live/playlist.m3u8', { pageIsHttps: true });
        expect(r.ok).toBe(true);
        if (r.ok) expect(r.isHls).toBe(true);
    });
});

describe('looksLikeHlsUrl', () => {
    it('detects m3u8 in path', () => {
        expect(looksLikeHlsUrl('https://x/y/stream.m3u8?token=1')).toBe(true);
    });
});

describe('redactUrlForDisplay', () => {
    it('removes userinfo', () => {
        expect(redactUrlForDisplay('https://user:secret@host/path')).toBe('https://host/path');
    });
});
