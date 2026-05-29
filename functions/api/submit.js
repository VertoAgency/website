// Cloudflare Pages Function — POST /api/submit
// Creates HubSpot contact + sends 2 emails (confirmation + internal) via Resend

const NOTIFY_EMAILS = [
  'paul.green@vertodigital.com',
  'zoran@vertodigital.com',
  'ivo@vertodigital.com',
  'yasen.lilov@vertodigital.com',
  'nikol.anestieva@vertodigital.com',
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

const ALLOWED_ORIGINS = [
  'https://vertodigital.com',
  'https://www.vertodigital.com',
];

export async function onRequestPost({ request, env }) {
  // CSRF: only accept requests from the production domain or CF Pages previews
  const origin = request.headers.get('Origin') || '';
  const isPreview = origin.endsWith('.vertodigital.pages.dev');
  if (origin && !ALLOWED_ORIGINS.includes(origin) && !isPreview) {
    return jsonRes({ success: false, message: 'Forbidden' }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonRes({ success: false, message: 'Invalid request' }, 400);
  }

  const { form_type, _hp, ...fields } = body;

  // Honeypot — silently accept but do nothing
  if (_hp) return jsonRes({ success: true });

  // Field length caps
  if (fields.name         && fields.name.length         > 100)  return jsonRes({ success: false, message: 'Invalid input' }, 400);
  if (fields.company      && fields.company.length      > 100)  return jsonRes({ success: false, message: 'Invalid input' }, 400);
  if (fields.title        && fields.title.length        > 100)  return jsonRes({ success: false, message: 'Invalid input' }, 400);
  if (fields.role         && fields.role.length         > 50)   return jsonRes({ success: false, message: 'Invalid input' }, 400);
  if (fields.message      && fields.message.length      > 2000) return jsonRes({ success: false, message: 'Invalid input' }, 400);
  if (fields.problem      && fields.problem.length      > 2000) return jsonRes({ success: false, message: 'Invalid input' }, 400);
  if (fields.email        && fields.email.length        > 254)  return jsonRes({ success: false, message: 'Valid work email required' }, 400);
  if (fields.utm_source   && fields.utm_source.length   > 100)  return jsonRes({ success: false, message: 'Invalid input' }, 400);
  if (fields.utm_medium   && fields.utm_medium.length   > 100)  return jsonRes({ success: false, message: 'Invalid input' }, 400);
  if (fields.utm_campaign && fields.utm_campaign.length > 200)  return jsonRes({ success: false, message: 'Invalid input' }, 400);
  if (fields.referrer     && fields.referrer.length     > 500)  return jsonRes({ success: false, message: 'Invalid input' }, 400);

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

  if (formType === 'contact_full' || formType === 'contact_mini') {
    const parts = (fields.name || '').trim().split(/\s+/);
    p.firstname      = parts[0] || '';
    p.lastname       = parts.slice(1).join(' ') || '';
    p.company        = fields.company || '';
    p.jobtitle       = formType === 'contact_full'
      ? (ROLE_LABELS[fields.role] || fields.role || '')
      : (fields.title || '');
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
  // Internal notification — required; if this fails we surface an error to the user
  await sendEmail({
    from:     FROM_TEAM,
    to:       NOTIFY_EMAILS,
    reply_to: fields.email,
    subject:  `[${formLabel(formType)}] ${fields.email}`,
    html:     notifyHtml(fields, formType),
  }, env);

  // Confirmation to submitter — best-effort; don't fail the submission if it bounces
  if (formType !== 'newsletter') {
    sendEmail({
      from:     FROM_TEAM,
      to:       [fields.email],
      reply_to: REPLY_TO,
      subject:  confirmSubject(formType),
      html:     confirmHtml(fields, formType),
    }, env).catch(e => console.error('Confirmation email failed:', e.message));
  }
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
        <img src="https://vertodigital.pages.dev/images/logos/vertodigital-email-logo.png" alt="VertoDigital" width="160" style="display:block;height:auto;border:0">
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

function validEmail(e) { return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(e); }

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
