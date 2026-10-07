import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg border font-medium shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        default: 'border-border bg-white text-ink hover:bg-surface',
        primary: 'border-accent bg-accent text-white hover:bg-accent-strong',
        danger: 'border-danger bg-white text-danger hover:bg-danger/10',
        ghost: 'border-transparent bg-transparent text-muted hover:bg-surface',
      },
      size: {
        sm: 'px-2.5 py-1 text-sm',
        md: 'px-4 py-2',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);
