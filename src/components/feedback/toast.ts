import type { StatusVariant } from './variants';

export type ToastVariant = StatusVariant;

export interface ToastOptions {
  variant?: ToastVariant;
  /** Milliseconds before the toast dismisses itself. */
  duration?: number;
}

export interface ToastDetail {
  message: string;
  variant: ToastVariant;
  duration: number;
}

/** The document event the Toast region listens for; scripts can dispatch it directly. */
export const TOAST_EVENT = 'toast';

/** Queues a message in the page's Toast region. */
export function toast(message: string, { variant = 'info', duration = 5000 }: ToastOptions = {}) {
  document.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail: { message, variant, duration } }));
}
