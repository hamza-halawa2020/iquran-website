const CHUNK_RELOAD_STATE_KEY = 'oim_lazy_chunk_reload';
const CHUNK_RELOAD_LISTENER_KEY = '__oimLazyChunkRecoveryInstalled';
const CHUNK_LOAD_PATTERNS = [
    /Failed to fetch dynamically imported module/i,
    /Importing a module script failed/i,
    /Loading chunk [\w-]+ failed/i,
    /ChunkLoadError/i,
];

export function clearLazyChunkReloadState(): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.removeItem(CHUNK_RELOAD_STATE_KEY);
}

export function installLazyChunkRecovery(): void {
    if (typeof window === 'undefined') {
        return;
    }

    const recoveryWindow = window as Window & {
        [CHUNK_RELOAD_LISTENER_KEY]?: boolean;
    };

    if (recoveryWindow[CHUNK_RELOAD_LISTENER_KEY]) {
        return;
    }

    recoveryWindow[CHUNK_RELOAD_LISTENER_KEY] = true;

    window.addEventListener('unhandledrejection', (event) => {
        if (!attemptLazyChunkRecovery(event.reason)) {
            return;
        }

        event.preventDefault();
    });
}

export function attemptLazyChunkRecovery(error: unknown): boolean {
    if (typeof window === 'undefined' || !isLazyChunkLoadError(error)) {
        return false;
    }

    const currentUrl = window.location.href;
    const lastReloadUrl = window.sessionStorage.getItem(CHUNK_RELOAD_STATE_KEY);

    if (lastReloadUrl === currentUrl) {
        window.sessionStorage.removeItem(CHUNK_RELOAD_STATE_KEY);
        return false;
    }

    window.sessionStorage.setItem(CHUNK_RELOAD_STATE_KEY, currentUrl);
    window.location.reload();
    return true;
}

export function isLazyChunkLoadError(error: unknown): boolean {
    const message = extractErrorMessage(error);
    return CHUNK_LOAD_PATTERNS.some((pattern) => pattern.test(message));
}

function extractErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
        return error;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (!error || typeof error !== 'object') {
        return '';
    }

    const candidate = error as {
        message?: unknown;
        reason?: unknown;
        rejection?: unknown;
        ngOriginalError?: unknown;
    };

    return [
        extractErrorMessage(candidate.message),
        extractErrorMessage(candidate.reason),
        extractErrorMessage(candidate.rejection),
        extractErrorMessage(candidate.ngOriginalError),
    ].find(Boolean) || '';
}
