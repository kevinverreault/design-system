/**
 * The status variants Alert and Toast share. Warnings and errors interrupt
 * (role="alert"); info and success wait their turn (role="status").
 */
export const statusVariants = {
  info: { role: 'status', icon: 'info' },
  success: { role: 'status', icon: 'circle-check' },
  warning: { role: 'alert', icon: 'triangle-alert' },
  danger: { role: 'alert', icon: 'circle-alert' },
} as const;

export type StatusVariant = keyof typeof statusVariants;

export function isStatusVariant(variant: unknown): variant is StatusVariant {
  return typeof variant === 'string' && Object.hasOwn(statusVariants, variant);
}
