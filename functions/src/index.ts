import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import twilio from 'twilio';

admin.initializeApp();
const db = admin.firestore();

type SmsQueueDoc = {
  userId: string;
  transactionId: string;
  memberId?: string;
  to: string;
  donorName?: string;
  amount: number;
  date: string; // ISO yyyy-mm-dd
  category?: string;
  status: 'queued' | 'processing' | 'sent' | 'failed';
  attempts: number;
  lastError?: string | null;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
};

const defaultTemplate = (
  'Greater Works City Church: Thank you {name} for your donation of {amount} on {date}. ' +
  'Transaction ID: {id}. Reply STOP to unsubscribe, HELP for help. Msg&Data rates may apply.'
);

function getTwilioConfig() {
  // Prefer environment variables, fall back to functions config
  const cfg = (functions.config() as any)?.twilio || {};
  const accountSid = process.env.TWILIO_ACCOUNT_SID || cfg.account_sid;
  const authToken = process.env.TWILIO_AUTH_TOKEN || cfg.auth_token;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID || cfg.messaging_service_sid;
  const fromNumber = process.env.TWILIO_FROM_NUMBER || cfg.from_number;
  const statusCallbackUrl = process.env.TWILIO_STATUS_CALLBACK_URL || cfg.status_callback_url;

  if (!accountSid || !authToken || (!messagingServiceSid && !fromNumber)) {
    throw new Error('Twilio configuration missing. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and either TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM_NUMBER.');
  }

  return { accountSid, authToken, messagingServiceSid, fromNumber, statusCallbackUrl } as {
    accountSid: string;
    authToken: string;
    messagingServiceSid?: string;
    fromNumber?: string;
    statusCallbackUrl?: string;
  };
}

async function getSmsSettings(userId: string): Promise<{
  enabled: boolean;
  templateText: string;
  sendWindowStart: string; // HH:mm
  sendWindowEnd: string; // HH:mm
}> {
  const docRef = db.doc(`users/${userId}/settings/sms`);
  const snap = await docRef.get();
  const data = snap.exists ? snap.data() : {};
  return {
    enabled: data?.enabled !== false,
    templateText: (data?.templateText as string) || defaultTemplate,
    sendWindowStart: (data?.sendWindowStart as string) || '08:00',
    sendWindowEnd: (data?.sendWindowEnd as string) || '21:00',
  };
}

function withinSendWindow(now: Date, startHHmm: string, endHHmm: string): boolean {
  const [sh, sm] = startHHmm.split(':').map(Number);
  const [eh, em] = endHHmm.split(':').map(Number);
  const start = new Date(now);
  start.setHours(sh, sm, 0, 0);
  const end = new Date(now);
  end.setHours(eh, em, 0, 0);
  return now >= start && now <= end;
}

function renderTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

export const onSmsQueueCreate = functions.region('us-central1').firestore
  .document('users/{userId}/smsQueue/{queueId}')
  .onCreate(async (snap, ctx) => {
    const data = snap.data() as SmsQueueDoc;
    const userId = ctx.params.userId as string;
    const queueId = ctx.params.queueId as string;

    const twilioCfg = getTwilioConfig();
    const client = twilio(twilioCfg.accountSid, twilioCfg.authToken);

    // Respect settings
    const settings = await getSmsSettings(userId);
    if (!settings.enabled) {
      await snap.ref.update({ status: 'failed', lastError: 'SMS disabled in settings', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      return;
    }

    // Safety checks: opt-in and phone format
    const isE164 = (num: string) => /^\+\d{7,15}$/.test(num);
    if ((data as any).optInSMS === false) {
      await snap.ref.update({ status: 'failed', lastError: 'Member not opted-in to SMS', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      return;
    }
    if (!data.to || !isE164(data.to)) {
      await snap.ref.update({ status: 'failed', lastError: 'Invalid or missing phone number', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      return;
    }

    const now = new Date();
    if (!withinSendWindow(now, settings.sendWindowStart, settings.sendWindowEnd)) {
      // Still send immediately for now but note scheduling opportunity
      await snap.ref.update({ status: 'processing', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    } else {
      await snap.ref.update({ status: 'processing', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    }

    const amountFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.amount);
    const rendered = renderTemplate(settings.templateText, {
      name: data.donorName || 'Donor',
      amount: amountFmt,
      date: data.date,
      id: data.transactionId,
    });

    const statusCallback = twilioCfg.statusCallbackUrl ? `${twilioCfg.statusCallbackUrl}?userId=${encodeURIComponent(userId)}&queueId=${encodeURIComponent(queueId)}` : undefined;

    const sendParams: any = {
      to: data.to,
      body: rendered,
    };
    if (twilioCfg.messagingServiceSid) sendParams.messagingServiceSid = twilioCfg.messagingServiceSid;
    else if (twilioCfg.fromNumber) sendParams.from = twilioCfg.fromNumber;
    if (statusCallback) sendParams.statusCallback = statusCallback;

    const maxAttempts = 3;
    let attempt = 0;
    let lastError: any = null;
    while (attempt < maxAttempts) {
      try {
        const msg = await client.messages.create(sendParams);
        await snap.ref.update({ status: 'sent', attempts: attempt + 1, lastError: null, messageSid: msg.sid, updatedAt: admin.firestore.FieldValue.serverTimestamp() } as any);
        return;
      } catch (err: any) {
        lastError = err?.message || String(err);
        attempt++;
        await snap.ref.update({ attempts: attempt, lastError, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        // Backoff: 1s, 3s
        await new Promise(res => setTimeout(res, attempt === 1 ? 1000 : 3000));
      }
    }
    await snap.ref.update({ status: 'failed', lastError, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  });

export const twilioStatusCallback = functions.region('us-central1').https.onRequest(async (req, res) => {
  try {
    const userId = String(req.query.userId || '');
    const queueId = String(req.query.queueId || '');
    if (!userId || !queueId) {
      res.status(400).send('Missing identifiers');
      return;
    }
    const status = (req.body?.MessageStatus as string) || (req.body?.message_status as string) || req.body?.status;
    const messageSid = (req.body?.MessageSid as string) || req.body?.SmsSid || req.body?.sid;
    const ref = db.doc(`users/${userId}/smsQueue/${queueId}`);
    await ref.update({ deliveryStatus: status, messageSid, updatedAt: admin.firestore.FieldValue.serverTimestamp() } as any);
    res.status(200).send('OK');
  } catch (e) {
    console.error('Twilio status callback error', e);
    res.status(500).send('Error');
  }
});