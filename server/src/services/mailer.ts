/** Transactional e-mail. The provider is configured by environment; without one, messages are logged (subject only) and dropped. */
export interface Mail { to: string; subject: string; html: string; text: string }
export interface Mailer { readonly configured: boolean; send(m: Mail): Promise<void> }

type Fetch = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal: AbortSignal }) => Promise<{ ok: boolean; status: number }>;

/** Resend (https://resend.com) HTTP API. Any provider with a similar JSON API can be added the same way. */
export function resendMailer(o: { apiKey: string; from: string; fetchImpl?: Fetch }): Mailer {
  const f: Fetch = o.fetchImpl ?? (fetch as unknown as Fetch);
  return {
    configured: true,
    async send(m) {
      const r = await f("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${o.apiKey}`, "content-type": "application/json" },
        body: JSON.stringify({ from: o.from, to: [m.to], subject: m.subject, html: m.html, text: m.text }), signal: AbortSignal.timeout(10_000) });
      if (!r.ok) throw new Error(`email provider returned ${r.status}`); // the queue retries with backoff
    },
  };
}

export function logMailer(log: (msg: string, extra: object) => void): Mailer {
  return { configured: false, async send(m) { log("email not sent: no provider configured", { subject: m.subject }); } };
}

export function memoryMailer(): Mailer & { sent: Mail[] } {
  const sent: Mail[] = [];
  return { configured: true, sent, async send(m) { sent.push(m); } };
}
