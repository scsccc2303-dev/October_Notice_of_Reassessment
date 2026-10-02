export default async function handler(req, res) {
  try {
    // Only allow GET and POST
    if (!["GET", "POST"].includes(req.method)) {
      return res.status(405).json({
        success: false,
        error: "Method not allowed"
      });
    }

    // Get data from POST body or GET query parameters
    let input = {};

    if (req.method === "POST") {
      input = typeof req.body === "object" ? req.body : {};
    } else {
      input = req.query || {};
    }

    const event = input.event || "LINK_CLICKED";
    const device = input.device || "Unknown";
    const page =
      input.page ||
      req.headers.referer ||
      "Unknown";

    const time =
      input.time ||
      new Date().toISOString();

    // Vercel/proxy headers
    const forwardedFor = req.headers["x-forwarded-for"];
    const ip =
      typeof forwardedFor === "string"
        ? forwardedFor.split(",")[0].trim()
        : "Unknown";

    const country =
      req.headers["x-vercel-ip-country"] ||
      req.headers["cf-ipcountry"] ||
      "Unknown";

    // Telegram credentials MUST come from Vercel Environment Variables
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({
        success: false,
        error: "Telegram environment variables are not configured."
      });
    }

   const message =
  "Document Activity\n\n" +
  "Event: " + event + "\n" +
  "Device: " + device + "\n" +
  "Country: " + country + "\n" +
  "IP: " + ip + "\n" +
  "Time: " + time + "\n" +
  "Page: " + page;

    const telegramURL =
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const telegramResponse = await fetch(telegramURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
      })
    });

    const telegramData = await telegramResponse.json();

    return res.status(telegramResponse.ok ? 200 : 500).json({
      success: telegramResponse.ok,
      http_code: telegramResponse.status,
      telegram_response: telegramData
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
