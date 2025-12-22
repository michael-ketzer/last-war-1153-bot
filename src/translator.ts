export async function detectLanguage(text: string): Promise<string> {
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
    return data[0].language;
  }

  console.log(response.status, response.body);
  throw new Error('Failed detection');
}

export async function translate(text: string, target: string): Promise<string> {
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
