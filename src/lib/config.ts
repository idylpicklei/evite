import weddingConfig from '../../config/wedding.json';

export type WeddingConfig = typeof weddingConfig;

export function getWeddingConfig(): WeddingConfig {
  return weddingConfig;
}

export function formatWeddingDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York',
  }).format(new Date(isoDate));
}
