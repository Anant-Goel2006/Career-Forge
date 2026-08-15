import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function matchesSkill(text: string, skill: string): boolean {
  const normalizedText = text ?? "";
  const normalizedSkill = skill.trim();

  if (!normalizedSkill) {
    return false;
  }

  const pattern = new RegExp(
    `(^|[^A-Za-z0-9])${escapeRegExp(normalizedSkill)}(?=$|[^A-Za-z0-9])`,
    "i"
  );

  return pattern.test(normalizedText);
}
