import { WinstonTransport as AxiomTransport } from '@axiomhq/winston';
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'tiktok-worker', server: process.env.SERVER_ID },
  transports: [
    new AxiomTransport({
      dataset: 'api',
      token: process.env.AXIOM_TOKEN,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}
