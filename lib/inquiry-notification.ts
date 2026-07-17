type InquiryNotification = {
  reference: string;
  type: "RFQ" | "Sample request";
  companyName: string;
  contactPerson: string;
  email: string;
  country: string;
  product: string;
  details: Array<[string, string | boolean | undefined]>;
};

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character] ?? character);
}

export async function sendInquiryNotification(inquiry: InquiryNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_FROM_EMAIL;
  const to = process.env.INQUIRY_NOTIFICATION_EMAIL;
  if (!apiKey || !from || !to) {
    console.warn("Inquiry email notification is not configured.");
    return { sent: false, reason: "not_configured" as const };
  }

  const rows: Array<[string, string | boolean | undefined]> = [
    ["Reference", inquiry.reference],
    ["Type", inquiry.type],
    ["Company", inquiry.companyName],
    ["Contact", inquiry.contactPerson],
    ["Email", inquiry.email],
    ["Country", inquiry.country],
    ["Product", inquiry.product],
    ...inquiry.details,
  ];
  const htmlRows = rows.filter(([, value]) => value !== undefined && value !== "").map(([label, value]) =>
    `<tr><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e8e3d8">${escapeHtml(label)}</th><td style="padding:8px 12px;border-bottom:1px solid #e8e3d8">${escapeHtml(value)}</td></tr>`,
  ).join("");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": inquiry.reference,
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: inquiry.email,
      subject: `[${inquiry.reference}] New ${inquiry.type} from ${inquiry.companyName}`,
      html: `<div style="font-family:Arial,sans-serif;color:#173220"><h2>New ${escapeHtml(inquiry.type)}</h2><p>A new buyer inquiry has been saved in Ask Global Admin.</p><table style="border-collapse:collapse;width:100%;max-width:720px">${htmlRows}</table><p style="margin-top:24px">Sign in to the admin panel to review and update its status.</p></div>`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Resend notification failed with status ${response.status}`);
  return { sent: true };
}
