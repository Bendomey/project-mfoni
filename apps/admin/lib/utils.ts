import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const createDataTableError = (error: Error | null, message = "Can't fetch data") => {
  return error ? new Error(message) : undefined;
};
