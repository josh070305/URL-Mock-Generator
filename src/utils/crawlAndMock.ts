import type { ProgressStep } from '../types';

export const PROGRESS_STEP_LABELS: string[] = [
  'Analysing URL...',
  'Identifying core pages...',
  'Reading page structure...',
  'Generating mocks with AI...',
  'Finalising results...',
];

export function buildProgressSteps(currentStep: number): ProgressStep[] {
  return PROGRESS_STEP_LABELS.map((label, index) => {
    const id = index + 1;
    let status: ProgressStep['status'] = 'pending';
    if (id < currentStep) status = 'done';
    else if (id === currentStep) status = 'active';
    return { id, label, status };
  });
}

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function validateUrl(raw: string): boolean {
  try {
    const url = new URL(normalizeUrl(raw));
    return Boolean(url.hostname) && url.hostname.includes('.');
  } catch {
    return false;
  }
}
