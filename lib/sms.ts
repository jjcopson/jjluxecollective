export async function sendSmsOtp(phone: string, code: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  const message = `Your JJ Luxe Collective verification code is ${code}. It expires in 10 minutes.`;

  if (!accountSid || !authToken || !from) {
    console.log("TWILIO is not configured. Development OTP:", code);
    return { sent: false, devOtp: code };
  }

  const twilio = (await import("twilio")).default;
  const client = twilio(accountSid, authToken);

  await client.messages.create({
    body: message,
    from,
    to: `+${phone}`,
  });

  return { sent: true, devOtp: "" };
}
