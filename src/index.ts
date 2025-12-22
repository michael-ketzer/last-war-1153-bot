import { Message } from 'discord.js';
import { config } from 'dotenv';
config();

import { initDiscordClient, sendWebhookMessage } from './discord';
import { detectLanguage, translate } from './translator';

const channelConfig: Record<
  string,
  {
    language: string;
    webhook: string;
  }
> = {
  '1451935412254801922': {
    language: 'en',
    webhook:
      'https://discord.com/api/webhooks/1452758955855057008/FdkpM6J-dk51xEQPSR4BodatOsOF_8DqG8TvyIMpEktgyfkWpkrOvXUay8Tbs4aIEpH7',
  },
  '1452614104572235837': {
    language: 'ar',
    webhook:
      'https://discord.com/api/webhooks/1452759283455230065/ascGy39djThat2XH4i5iOp8wp07VEQsBH35aoyRAdXTlL6tq9R3uwk_6j2eOJfQWbTJ_',
  },
  '1452615507323650049': {
    language: 'de',
    webhook:
      'https://discord.com/api/webhooks/1452760500466094214/9rDueCCneaLMJgG8nz1ekK-TWIfi4cQ27gEC6CEkbkr2htKGISqySCurehOtZBuoaNe3',
  },
  '1452615537367715951': {
    language: 'fr',
    webhook:
      'https://discord.com/api/webhooks/1452760623409795125/3oi_qDJ7FEFRcCBpCiXDI9rtEK4WoobyY32HAfPzN3WWs5g3iBpJbzl3IBkmRJi00GXH',
  },
  '1452720854071771332': {
    language: 'it',
    webhook:
      'https://discord.com/api/webhooks/1452760747900670063/rili1vBdOGWUPqE5e3x_HBIxqTBKcV-pBj1ZR7RkzC4SVlcmNjeDGykGb5zdrKxlare5',
  },
  '1452720889828343878': {
    language: 'es',
    webhook:
      'https://discord.com/api/webhooks/1452760847649607801/oSdSeip1w5o8JBFIuPBZh5PIRxErRRaX3YLv30ud3PsFCWHkJnNzDM0p4OTytzO-sy-R',
  },
};

const channelEntries = Object.entries(channelConfig);

const singleChannelTranslations = [
  '1451987608631644380',
  '1452258397163360407',
  '1451991206409011270',
  '1451991231281365166',
];

async function onMessage(message: Message): Promise<void> {
  const sourceChannel = channelConfig[message.channelId];
  if (!sourceChannel) {
    const trimmedContent = message.content.trim();
    if (trimmedContent) {
      const detectedLanguage = await detectLanguage(trimmedContent);
      if (detectedLanguage !== 'en') {
        const translated = await translate(trimmedContent, 'en');
        await message.reply(translated);
      }
    }
    return;
  }

  const trimmedContent = message.content.trim();
  if (!trimmedContent) {
    if (message.attachments.size > 0) {
      await sendWebhookMessage(sourceChannel.webhook, message, '');
    }
    return;
  }

  const detectedLanguage = await detectLanguage(trimmedContent);
  if (detectedLanguage !== sourceChannel.language) {
    const translated = await translate(trimmedContent, sourceChannel.language);
    await message.reply(translated);
  }

  for (const [channelId, { language, webhook }] of channelEntries) {
    if (channelId !== message.channelId) {
      const translated = await translate(trimmedContent, language);
      await sendWebhookMessage(webhook, message, translated);
    }
  }
}

(async () => {
  await initDiscordClient([...Object.keys(channelConfig), ...singleChannelTranslations], onMessage);
  console.log('Starting up worker.');
})();
