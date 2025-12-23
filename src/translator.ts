import * as deepl from 'deepl-node';

const deeplClient = new deepl.DeepLClient(process.env.DEEPL_API_KEY);

export async function detectLanguage(text: string): Promise<deepl.TargetLanguageCode> {
  const response = await fetch('https://translate.mketzer.dev/detect', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      q: text,
    }),
  });

  if (response.ok) {
    const data = (await response.json()) as Array<{ confidence: number; language: string }>;
    return data[0].language == 'en' ? 'en-US' : (data[0].language as deepl.TargetLanguageCode);
  }

  console.log(response.status, response.body);
  throw new Error('Failed detection');
}

export async function translate(text: string, target: deepl.TargetLanguageCode): Promise<string> {
  const usage = await deeplClient.getUsage();
  if (!usage.anyLimitReached()) {
    const result = await deeplClient.translateText(text, null, target);
    return result.text;
  }

  const response = await fetch('https://translate.mketzer.dev/translate', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      target,
      q: text,
      source: 'auto',
    }),
  });

  if (response.ok) {
    const data = (await response.json()) as { translatedText: string };
    return data.translatedText;
  }

  console.log(response.status, response.body);
  throw new Error('Failed translation');
}
