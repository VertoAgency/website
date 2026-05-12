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
    const [company, title] = (fields.company_title || '').split(/[·\-]/).map(s => s.trim());
    if (company) p.company  = company;
    if (title)   p.jobtitle = title;
    p.lifecyclestage = 'lead';
  } else if (formType === 'newsletter') {
    p.lifecyclestage = 'subscriber';
  }

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
  await Promise.all([
    sendEmail({
      from:     FROM_TEAM,
      to:       [fields.email],
      reply_to: REPLY_TO,
      subject:  confirmSubject(formType),
      html:     confirmHtml(fields, formType),
    }, env),
    sendEmail({
      from:     FROM_TEAM,
      to:       NOTIFY_EMAILS,
      reply_to: fields.email,
      subject:  `[${formLabel(formType)}] ${fields.email}`,
      html:     notifyHtml(fields, formType),
    }, env),
  ]);
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

  const body = formType === 'newsletter'
    ? `<p style="${P}">You're in.</p>
       <p style="${P}">The VertoDigital newsletter goes to B2B marketing leaders who want sharper pipeline thinking — not more noise.</p>
       <p style="${P_LAST}">First issue lands next week.</p>
       <p style="${SIGN}">— The VertoDigital team</p>`
    : `<p style="${P}">${greeting}</p>
       <p style="${P}">We received your note. Someone from the team will reply within one business day.</p>
       <p style="${P_LAST}">In the meantime, you can <a href="${SITE_URL}/assessment" style="color:#0099FF;text-decoration:none">book a pipeline diagnostic</a> and get on the calendar directly.</p>
       <p style="${SIGN}">— Paul Green, VertoDigital</p>`;

  return emailWrapper(body);
}

function notifyHtml(fields, formType) {
  const rows = notifyRows(fields, formType);
  const time  = new Date().toUTCString();

  const body = `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#060026;border-radius:8px 8px 0 0;margin-bottom:24px">
      <tr>
        <td style="padding:20px 32px">
          <p style="margin:0;font-size:10px;font-family:monospace;letter-spacing:0.15em;text-transform:uppercase;color:#43E5FF">${esc(formLabel(formType))}</p>
          <p style="margin:4px 0 0;font-size:17px;font-weight:600;color:#ffffff">${esc(fields.email)}</p>
        </td>
      </tr>
    </table>
    ${rows}
    <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;font-family:monospace;color:#9ca3af">${time}</p>`;

  return emailWrapper(body, true);
}

function notifyRows(fields, formType) {
  const items = [];
  if (formType === 'contact_full') {
    items.push(['Name',    fields.name    || '—']);
    items.push(['Email',   fields.email]);
    items.push(['Company', fields.company || '—']);
    items.push(['Role',    ROLE_LABELS[fields.role] || fields.role || '—']);
    if (fields.problem) items.push(['Problem', fields.problem]);
  } else if (formType === 'contact_mini') {
    items.push(['Email',          fields.email]);
    items.push(['Company · Title', fields.company_title || '—']);
    if (fields.message) items.push(['Message', fields.message]);
  } else {
    items.push(['Email', fields.email]);
  }

  return items.map(([label, value]) => `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px">
      <tr>
        <td width="130" style="font-size:10px;font-family:monospace;letter-spacing:0.1em;text-transform:uppercase;color:#9ca3af;padding-top:2px;vertical-align:top">${esc(label)}</td>
        <td style="font-size:14px;color:#060026;line-height:1.5;vertical-align:top;white-space:pre-wrap">${esc(String(value))}</td>
      </tr>
    </table>`).join('');
}

// Shared email shell
const P      = 'margin:0 0 14px;font-size:15px;color:#374151;line-height:1.6';
const P_LAST = 'margin:0 0 28px;font-size:15px;color:#374151;line-height:1.6';
const SIGN   = 'margin:0;font-size:14px;color:#6b7280;line-height:1.6';

function emailWrapper(inner, compact = false) {
  const pad = compact ? '24px 32px' : '36px 40px 32px';
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px">
  <tr><td align="center">
    <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:580px;width:100%">
      <tr><td style="background:#060026;padding:24px 40px">
        <img src="${SITE_URL}/images/vertodigital-logo-light.svg" alt="VertoDigital" width="140" height="39" style="display:block">
      </td></tr>
      <tr><td style="padding:${pad}">${inner}</td></tr>
      <tr><td style="background:#f8fafc;padding:16px 40px;border-top:1px solid #e5e7eb">
        <p style="margin:0;font-size:11px;color:#9ca3af">VertoDigital &nbsp;·&nbsp; <a href="${SITE_URL}" style="color:#0099FF;text-decoration:none">vertodigital.com</a></p>
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
