import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Cleanly merges Tailwind CSS classes, resolving conflicts and handling conditional classes.
 * Standard utility for modern React/Tailwind development.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
