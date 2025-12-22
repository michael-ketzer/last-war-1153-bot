import * as Sentry from '@sentry/node';
import { logger } from './logger';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
});

export function captureError(error: string, data: any): void {
  logger.error(error, data);
  Sentry.captureException(error);
}
