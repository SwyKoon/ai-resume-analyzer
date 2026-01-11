import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

// This function is crated bt Tailwinf by default, but we have to crate it here in our case
// because it was not created.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formats a file size in bytes to a human readable string (KB, MB, GB, etc.)
export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  // Determine the appropriate unit by calculating the log
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Format with 2 decimal places and round
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const generateUUID = () => crypto.randomUUID();