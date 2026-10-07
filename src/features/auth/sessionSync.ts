import { REFRESH_TOKEN_KEY } from './tokenStore.ts';

export type SessionMessage = { type: 'logout' } | { type: 'login' };

export interface SessionSync {
  post: (message: SessionMessage) => void;
  close: () => void;
}

export type ConnectSessionSync = (onMessage: (message: SessionMessage) => void) => SessionSync;

export const SESSION_CHANNEL_NAME = 'auth';

export function isSessionMessage(value: unknown): value is SessionMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    (value.type === 'logout' || value.type === 'login')
  );
}

function connectBroadcastChannel(
  channel: BroadcastChannel,
  onMessage: (message: SessionMessage) => void,
): SessionSync {
  const listener = (event: MessageEvent<unknown>) => {
    if (isSessionMessage(event.data)) onMessage(event.data);
  };
  channel.addEventListener('message', listener);
  return {
    post: (message) => channel.postMessage(message),
    close: () => {
      channel.removeEventListener('message', listener);
      channel.close();
    },
  };
}

function connectStorageEvents(onMessage: (message: SessionMessage) => void): SessionSync {
  const listener = (event: StorageEvent) => {
    if (event.key !== REFRESH_TOKEN_KEY && event.key !== null) return;
    onMessage(event.newValue === null ? { type: 'logout' } : { type: 'login' });
  };
  window.addEventListener('storage', listener);
  return {
    post: () => undefined,
    close: () => window.removeEventListener('storage', listener),
  };
}

export function connectSessionSync(
  onMessage: (message: SessionMessage) => void,
  channel: BroadcastChannel | null = typeof BroadcastChannel === 'undefined'
    ? null
    : new BroadcastChannel(SESSION_CHANNEL_NAME),
): SessionSync {
  return channel ? connectBroadcastChannel(channel, onMessage) : connectStorageEvents(onMessage);
}
