import { ErrorHandler, Injectable } from '@angular/core';
import { attemptLazyChunkRecovery } from './lazy-chunk-recovery';

@Injectable()
export class LazyChunkErrorHandler implements ErrorHandler {
    handleError(error: unknown): void {
        if (attemptLazyChunkRecovery(error)) {
            return;
        }

        console.error(error);
    }
}
