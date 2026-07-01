/**
 * Send SMS using Twilio's REST API (via native global fetch)
 */
export async function sendSMS(to, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.warn("⚠️ Twilio credentials missing in .env. SMS REST API is not configured; falling back to simulated SMS.");
    return { success: false, mode: "mock" };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    
    const params = new URLSearchParams();
    params.append("To", to);
    params.append("From", from);
    params.append("Body", body);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`✅ SMS OTP sent successfully to ${to} via Twilio REST API! Message SID: ${data.sid}`);
      return { success: true, mode: "twilio", sid: data.sid };
    } else {
      console.error("❌ Twilio REST API returned error:", data);
      return { success: false, mode: "error", error: data.message };
    }
  } catch (err) {
    console.error("❌ Failed to connect to Twilio SMS REST API:", err);
    return { success: false, mode: "error", error: err.message };
  }
}
