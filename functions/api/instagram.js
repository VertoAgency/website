const FB_PAGE_ID = '1426200457511159';

export async function onRequest(context) {
  const token = context.env.INSTAGRAM_TOKEN;

  if (!token) {
    return json({ error: 'INSTAGRAM_TOKEN not configured' }, 500);
  }

  try {
    const pageRes = await fetch(
      `https://graph.facebook.com/v21.0/${FB_PAGE_ID}?fields=instagram_business_account&access_token=${token}`
    );
    const page = await pageRes.json();
    const igId = page.instagram_business_account?.id;
    if (!igId) throw new Error('Instagram Business Account not found on this Page');

    const mediaRes = await fetch(
      `https://graph.facebook.com/v21.0/${igId}/media?fields=id,media_type,media_url,thumbnail_url,permalink&limit=6&access_token=${token}`
    );
    const media = await mediaRes.json();
    if (media.error) throw new Error(media.error.message);

    return json(media, 200, { 'Cache-Control': 'public, max-age=3600' });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra }
  });
}
