// Cloudflare Pages Function — POST /api/submit
// Creates HubSpot contact + sends 2 emails (confirmation + internal) via Resend

const NOTIFY_EMAILS = [
  'paul.green@vertodigital.com',
  'zoran@vertodigital.com',
  'ivo@vertodigital.com',
  'yasen.lilov@vertodigital.com',
];

const FROM_TEAM   = 'VertoDigital <team@resend.vertodigital.com>';
const REPLY_TO    = 'paul.green@vertodigital.com';
const SITE_URL    = 'https://vertodigital.com';

const ROLE_LABELS = {
  cmo:           'CMO',
  vp_marketing:  'VP / Head of Marketing',
  founder_ceo:   'Founder / CEO',
  head_growth:   'Head of Growth',
  demand_gen:    'Demand Gen / Performance Lead',
  other:         'Other',
};

// ─── Entry point ────────────────────────────────────────────────────────────

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonRes({ success: false, message: 'Invalid request' }, 400);
  }

  const { form_type, _hp, ...fields } = body;

  // Honeypot — silently accept but do nothing
  if (_hp) return jsonRes({ success: true });

  if (!fields.email || !validEmail(fields.email)) {
    return jsonRes({ success: false, message: 'Valid work email required' }, 400);
  }

  if (!['contact_full', 'contact_mini', 'newsletter'].includes(form_type)) {
    return jsonRes({ success: false, message: 'Unknown form type' }, 400);
  }

  const [hsResult, emailResult] = await Promise.allSettled([
    upsertContact(fields, form_type, env),
    sendEmails(fields, form_type, env),
  ]);

  if (emailResult.status === 'rejected') {
    console.error('Resend failed:', emailResult.reason?.message);
    return jsonRes({ success: false, message: 'Could not send confirmation email — please try again.' }, 500);
  }

  if (hsResult.status === 'rejected') {
    // Non-blocking: log but don't fail the user
    console.error('HubSpot failed:', hsResult.reason?.message);
  }

  return jsonRes({ success: true });
}

// ─── HubSpot ─────────────────────────────────────────────────────────────────

async function upsertContact(fields, formType, env) {
  const res = await fetch(
    'https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.HUBSPOT_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [{ idProperty: 'email', id: fields.email, properties: buildProps(fields, formType) }],
      }),
    }
  );

  if (!res.ok) throw new Error(`HubSpot upsert ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const contactId = data.results?.[0]?.id;

  const noteText = fields.problem || fields.message;
  if (noteText && contactId) {
    await createNote(contactId, noteText, env).catch(e => console.error('Note error:', e.message));
  }
}

function buildProps(fields, formType) {
  const p = { email: fields.email };

  if (formType === 'contact_full') {
    const parts = (fields.name || '').trim().split(/\s+/);
    p.firstname       = parts[0] || '';
    p.lastname        = parts.slice(1).join(' ') || '';
    p.company         = fields.company || '';
    p.jobtitle        = ROLE_LABELS[fields.role] || fields.role || '';
    p.lifecyclestage  = 'lead';
  } else if (formType === 'contact_mini') {
    const parts = (fields.name || '').trim().split(/\s+/);
    p.firstname      = parts[0] || '';
    p.lastname       = parts.slice(1).join(' ') || '';
    p.company        = fields.company || '';
    p.jobtitle       = fields.title   || '';
    p.lifecyclestage = 'lead';
  } else if (formType === 'newsletter') {
    p.lifecyclestage = 'subscriber';
  }

  if (fields.utm_source)   p.utm_source   = fields.utm_source;
  if (fields.utm_medium)   p.utm_medium   = fields.utm_medium;
  if (fields.utm_campaign) p.utm_campaign = fields.utm_campaign;

  return p;
}

async function createNote(contactId, body, env) {
  const res = await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.HUBSPOT_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        hs_note_body:  esc(body),
        hs_timestamp:  new Date().toISOString(),
      },
      associations: [{
        to:    { id: contactId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }],
      }],
    }),
  });
  if (!res.ok) throw new Error(`Note ${res.status}`);
}

// ─── Resend emails ───────────────────────────────────────────────────────────

async function sendEmails(fields, formType, env) {
  const sends = [
    sendEmail({
      from:     FROM_TEAM,
      to:       NOTIFY_EMAILS,
      reply_to: fields.email,
      subject:  `[${formLabel(formType)}] ${fields.email}`,
      html:     notifyHtml(fields, formType),
    }, env),
  ];

  if (formType !== 'newsletter') {
    sends.push(sendEmail({
      from:     FROM_TEAM,
      to:       [fields.email],
      reply_to: REPLY_TO,
      subject:  confirmSubject(formType),
      html:     confirmHtml(fields, formType),
    }, env));
  }

  await Promise.all(sends);
}

async function sendEmail(payload, env) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

// ─── Email templates ─────────────────────────────────────────────────────────

function confirmSubject(formType) {
  return formType === 'newsletter'
    ? "You're subscribed — VertoDigital"
    : "We received your note — VertoDigital";
}

function confirmHtml(fields, formType) {
  const firstName = (fields.name || '').trim().split(/\s+/)[0];
  const greeting  = firstName ? `Hi ${esc(firstName)},` : 'Hi,';

  if (formType === 'newsletter') {
    return emailShell({
      eyebrow:  'Newsletter',
      heading:  "You're in.",
      body: `
        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7">The VertoDigital newsletter goes to B2B marketing leaders who want sharper pipeline thinking — not more noise.</p>
        <p style="margin:0 0 32px;font-size:15px;color:#374151;line-height:1.7">First issue lands next week.</p>
        <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6">— The VertoDigital Team</p>`,
    });
  }

  return emailShell({
    eyebrow:  'Note received',
    heading:  greeting,
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7">We received your note. Someone from the team will reply within one business day.</p>
      <p style="margin:0 0 32px;font-size:15px;color:#374151;line-height:1.7">In the meantime, you can book time directly if that's easier.</p>
      <table cellpadding="0" cellspacing="0" style="margin-bottom:32px">
        <tr>
          <td style="background:#0099FF;border-radius:8px">
            <a href="${SITE_URL}/assessment" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.01em">Book a pipeline diagnostic &rarr;</a>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6">— Paul Green, VertoDigital</p>`,
  });
}

function notifyHtml(fields, formType) {
  const time = new Date().toUTCString();
  const rows = buildNotifyRows(fields, formType);

  return emailShell({
    eyebrow: formLabel(formType),
    heading: fields.email,
    body: `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
        ${rows}
      </table>
      <p style="margin:0;font-size:10px;font-family:monospace;letter-spacing:0.08em;color:#9ca3af">${esc(time)}</p>`,
  });
}

function buildNotifyRows(fields, formType) {
  const items = [];
  if (formType === 'contact_full') {
    items.push(['Name',    fields.name    || '—']);
    items.push(['Email',   fields.email]);
    items.push(['Company', fields.company || '—']);
    items.push(['Role',    ROLE_LABELS[fields.role] || fields.role || '—']);
    if (fields.problem) items.push(['Problem', fields.problem]);
  } else if (formType === 'contact_mini') {
    items.push(['Name',    fields.name    || '—']);
    items.push(['Email',   fields.email]);
    items.push(['Title',   fields.title   || '—']);
    items.push(['Company', fields.company || '—']);
    if (fields.message) items.push(['Message', fields.message]);
  } else {
    items.push(['Email', fields.email]);
  }

  if (fields.utm_source)   items.push(['UTM Source',   fields.utm_source]);
  if (fields.utm_medium)   items.push(['UTM Medium',   fields.utm_medium]);
  if (fields.utm_campaign) items.push(['UTM Campaign', fields.utm_campaign]);
  if (fields.referrer)     items.push(['Referrer',     fields.referrer]);

  return items.map(([label, value], i) => {
    const isLast  = i === items.length - 1;
    const isLong  = String(value).length > 80;
    const border  = isLast ? '' : 'border-bottom:1px solid #f0f4f8;';
    return `<tr>
      <td width="90" style="padding:12px 16px 12px 0;font-size:10px;font-family:monospace;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;vertical-align:top;${border}">${esc(label)}</td>
      <td style="padding:12px 0;font-size:${isLong ? 13 : 14}px;color:#060026;line-height:1.55;vertical-align:top;${border}">${esc(String(value))}</td>
    </tr>`;
  }).join('');
}

// ─── Shared components ───────────────────────────────────────────────────────

function emailShell({ eyebrow, heading, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(heading)}</title></head>
<body style="margin:0;padding:0;background:#d9f0ff;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#d9f0ff;padding:40px 16px">
  <tr><td align="center">
    <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%">

      <!-- Logo -->
      <tr><td style="padding-bottom:28px;padding-left:4px">
        <img src="data:image/png;base64,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AADF2OalBgAAAAAAAKAUQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAYQnIAAAAAAAAAiiEkBwAAAAAAAKAMIYT/DwwyWshyikOGAAAAAElFTkSuQmCC" alt="VertoDigital" width="160" style="display:block;height:auto;border:0">
      </td></tr>

      <!-- Card -->
      <tr><td style="background:#ffffff;border-radius:16px;overflow:hidden">

        <!-- Top accent bar -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="4" style="background:#0099FF;font-size:0;line-height:0">&nbsp;</td>
            <td style="padding:32px 36px 28px">
              <p style="margin:0 0 10px;font-size:10px;font-family:monospace;letter-spacing:0.18em;text-transform:uppercase;color:#0099FF">${esc(eyebrow)}</p>
              <p style="margin:0;font-size:26px;font-weight:700;color:#060026;letter-spacing:-0.025em;line-height:1.2">${esc(heading)}</p>
            </td>
          </tr>
        </table>

        <!-- Divider -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:0 36px"><div style="height:1px;background:#e9ecef;font-size:0;line-height:0">&nbsp;</div></td></tr>
        </table>

        <!-- Body -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:28px 36px 32px">${body}</td></tr>
        </table>

      </td></tr>

      <!-- Footer -->
      <tr><td style="padding-top:20px;text-align:center">
        <p style="margin:0;font-size:11px;color:#4a6a7a"><a href="${SITE_URL}" style="color:#0066CC;text-decoration:none">vertodigital.com</a></p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function formLabel(t) {
  return { contact_full: 'Contact — full form', contact_mini: 'Contact — quick form', newsletter: 'Newsletter signup' }[t] || t;
}

function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
