const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store"
    }
  });

const clean = (value, max = 5000) =>
  String(value ?? "").trim().slice(0, max);

const escapeHtml = (value) =>
  clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

async function sendEmail(env, { subject, replyTo, text, html }) {
  if (!env.RESEND_API_KEY) throw new Error("Email service is not configured.");
  if (!env.CONTACT_TO_EMAIL) throw new Error("Email destination is not configured.");
  if (!env.CONTACT_FROM_EMAIL) throw new Error("Sender address is not configured.");

  const payload = {
    from: env.CONTACT_FROM_EMAIL,
    to: [env.CONTACT_TO_EMAIL],
    subject,
    text,
    html
  };

  if (replyTo) payload.reply_to = replyTo;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Email provider error:", response.status, detail);
    throw new Error("Email could not be sent.");
  }
}

async function handleContact(request, env) {
  try {
    const body = await request.json();

    const name = clean(body.name, 80);
    const email = clean(body.email, 160).toLowerCase();
    const topic = clean(body.topic, 80) || "General question";
    const message = clean(body.message, 5000);

    if (name.length < 2) return json({ error: "Enter your name." }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Enter a valid email address." }, 400);
    }
    if (message.length < 5) return json({ error: "Enter a message." }, 400);

    const subject = `ReadySetPrep: ${topic}`;
    const text =
`Name: ${name}
Email: ${email}
Topic: ${topic}

${message}`;

    const html = `
      <h2>ReadySetPrep contact message</h2>
      <p><b>Name:</b> ${escapeHtml(name)}</p>
      <p><b>Email:</b> ${escapeHtml(email)}</p>
      <p><b>Topic:</b> ${escapeHtml(topic)}</p>
      <p><b>Message:</b></p>
      <p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>
    `;

    await sendEmail(env, {
      subject,
      replyTo: email,
      text,
      html
    });

    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ error: "Unable to send your message right now." }, 500);
  }
}

async function handleAccessApproval(request, env) {
  try {
    const body = await request.json();

    const requestId = clean(body.requestId, 80);
    const accessLabel = clean(body.accessLabel, 80);
    const requestedCode = clean(body.requestedCode, 80);
    const name = clean(body.name, 80);
    const email = clean(body.email, 160).toLowerCase();

    if (!requestId || !accessLabel || !requestedCode) {
      return json({ error: "Approval request is incomplete." }, 400);
    }

    const subject = `ReadySetPrep access approval: ${requestId}`;
    const text =
`Please review this ReadySetPrep complimentary-access request.

Request ID: ${requestId}
Access type: ${accessLabel}
Access code used: ${requestedCode}
Name: ${name}
Email: ${email}

If approved, provide the private approval code to the requester.`;

    const html = `
      <h2>ReadySetPrep complimentary-access request</h2>
      <p><b>Request ID:</b> ${escapeHtml(requestId)}</p>
      <p><b>Access type:</b> ${escapeHtml(accessLabel)}</p>
      <p><b>Access code used:</b> ${escapeHtml(requestedCode)}</p>
      <p><b>Name:</b> ${escapeHtml(name)}</p>
      <p><b>Email:</b> ${escapeHtml(email)}</p>
      <p>If approved, provide the private approval code to the requester.</p>
    `;

    await sendEmail(env, {
      subject,
      replyTo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined,
      text,
      html
    });

    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ error: "Unable to send the approval request right now." }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
      return handleContact(request, env);
    }

    if (url.pathname === "/api/access-approval") {
      if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
      return handleAccessApproval(request, env);
    }

    // Serve all normal HTML/static files through Cloudflare Pages.
    return env.ASSETS.fetch(request);
  }
};
