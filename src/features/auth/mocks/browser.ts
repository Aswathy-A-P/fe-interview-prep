import { setupWorker } from 'msw/browser';
import { createAuthHandlers } from './handlers.ts';

export const worker = setupWorker(...createAuthHandlers());
