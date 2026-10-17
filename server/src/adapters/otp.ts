/**
 * OTP delivery adapter.
 * DEV adapter (console) logs the code — HARD-DISABLED when NODE_ENV=production.
 * Production adapters: MSG91, Twilio Verify. Selected via OTP_PROVIDER.
 */

export interface OtpSendResult {
  ok: boolean;
  provider: string;
}

export async function sendOtp(phone: string, code: string): Promise<OtpSendResult> {
  const provider = process.env.OTP_PROVIDER || 'console';

  if (provider === 'console') {
    if (process.env.NODE_ENV === 'production') {
      // Refuse to run the dev adapter in prod — fail the request rather than leak codes.
      throw new Error('OTP_PROVIDER=console is not allowed in production');
    }
    console.log(`[DEV OTP] phone=${phone} code=${code}`);
    return { ok: true, provider: 'console' };
  }

  if (provider === 'msg91') {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;
    if (!authKey || !templateId) throw new Error('MSG91 credentials missing');
    const res = await fetch('https://control.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: { authkey: authKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template_id: templateId,
        mobile: phone.replace('+', ''),
        otp: code,
      }),
    });
    if (!res.ok) throw new Error(`MSG91 error ${res.status}`);
    return { ok: true, provider: 'msg91' };
  }

  if (provider === 'twilio') {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!sid || !authToken || !serviceSid) throw new Error('Twilio credentials missing');
    // Twilio Verify sends its own code; we don't pass ours.
    const res = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: phone, Channel: 'sms' }),
    });
    if (!res.ok) throw new Error(`Twilio error ${res.status}`);
    return { ok: true, provider: 'twilio' };
  }

  throw new Error(`Unknown OTP_PROVIDER: ${provider}`);
}
