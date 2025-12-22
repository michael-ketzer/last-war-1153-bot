export async function push(name: string, data: object): Promise<void> {
  fetch(`https://api.tinybird.co/v0/events?name=${name}`, {
    method: 'POST',
    body: JSON.stringify({ timestamp: new Date(), ...data }),
    headers: {
      Authorization: process.env.TINYBIRD_API_KEY,
    },
  });
}
