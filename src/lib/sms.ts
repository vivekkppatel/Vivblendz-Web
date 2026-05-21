const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER;

/** Sends an SMS. Silently skips if Twilio env vars are not set. */
export async function sendSMS(to: string, message: string): Promise<void> {
  if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM_NUMBER) return;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`;
  const credentials = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64");

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: to,
      From: FROM_NUMBER,
      Body: message,
    }).toString(),
  });
}
