import { config } from 'dotenv';
config();

import { logger } from './services/logger';

(async () => {
  logger.info('Starting up worker.');
})();
