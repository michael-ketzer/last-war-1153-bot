import { AttachmentBuilder, Client, GatewayIntentBits, Message, WebhookClient } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // REQUIRED
  ],
});
const webhookClients = new Map<string, WebhookClient>();

export async function initDiscordClient(
  channelIds: string[],
  messageCallback: (message: Message, referenceMessage?: Message | null) => Promise<void>,
): Promise<void> {
  client.on('messageCreate', async (message) => {
    // Ignore bots (important, or you’ll loop via webhook messages)
    if (message.author.bot) return;

    // Treat thread replies as belonging to their parent channel.
    const watchedChannelId = message.channel.isThread()
      ? message.channel.parentId
      : message.channelId;
    if (!watchedChannelId) return;

    // Only watch specific channels
    if (!channelIds.includes(watchedChannelId)) return;

    const referenceMessage = message.reference?.messageId
      ? await message.fetchReference().catch(() => null)
      : null;

    await messageCallback(message, referenceMessage);
  });

  await client.login(process.env.DISCORD_BOT_TOKEN);
}

export async function replyToMessage(message: Message, text: string): Promise<void> {
  await message.reply(text);
}

function getWebhookClient(webhookUrl: string): WebhookClient {
  const existingClient = webhookClients.get(webhookUrl);
  if (existingClient) {
    return existingClient;
  }

  const newClient = new WebhookClient({ url: webhookUrl });
  webhookClients.set(webhookUrl, newClient);
  return newClient;
}

async function buildMessageAttachments(message: Message): Promise<AttachmentBuilder[]> {
  const attachments = Array.from(message.attachments.values());
  if (attachments.length === 0) {
    return [];
  }

  const files = await Promise.all(
    attachments.map(async (attachment) => {
      const response = await fetch(attachment.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch attachment ${attachment.url} (${response.status})`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return new AttachmentBuilder(Buffer.from(arrayBuffer), {
        name: attachment.name ?? 'attachment',
      });
    }),
  );

  return files;
}

export async function sendWebhookMessage(
  webhookUrl: string,
  message: Message,
  content: string,
): Promise<void> {
  const webhookClient = getWebhookClient(webhookUrl);
  const displayName = message.member?.displayName ?? message.author.username;
  const avatarURL =
    message.member?.displayAvatarURL({ extension: 'png' }) ??
    message.author.displayAvatarURL({ extension: 'png' });
  const files = await buildMessageAttachments(message);

  await webhookClient.send({
    content,
    username: displayName,
    avatarURL,
    files: files.length > 0 ? files : undefined,
  });
}
