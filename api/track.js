export default async function handler(req, res) {
try {
// Allow only GET and POST
if (!["GET", "POST"].includes(req.method)) {
return res.status(405).json({
success: false,
error: "Method not allowed"
});
}

// Get data
let input = {};

if (req.method === "POST") {
input = typeof req.body === "object" ? req.body : {};
} else {
input = req.query || {};
}

// Activity information
const event = input.event || "PAGE_OPENED";
const device = input.device || "Unknown";
const page =
input.page ||
req.headers.referer ||
"Unknown";

const time =
input.time ||
new Date().toISOString();

// Get visitor IP
const forwardedFor = req.headers["x-forwarded-for"];

const ip =
typeof forwardedFor === "string"
? forwardedFor.split(",")[0].trim()
: "Unknown";

// Get country
const countryCode =
req.headers["x-vercel-ip-country"] || "";

const countryNames = {
US: "United States",
CA: "Canada",
GB: "United Kingdom",
NG: "Nigeria",
AU: "Australia",
DE: "Germany",
FR: "France",
IT: "Italy",
ES: "Spain",
NL: "Netherlands",
IE: "Ireland",
GH: "Ghana",
ZA: "South Africa",
KE: "Kenya",
IN: "India",
AE: "United Arab Emirates"
};

const country =
countryNames[countryCode.toUpperCase()] ||
countryCode.toUpperCase() ||
"Unknown";

// Event names
const eventNames = {
PAGE_OPENED: "PAGE OPENED",
PASSWORD_COPIED: "PASSWORD COPIED",
DOWNLOAD_CLICKED: "DOWNLOAD CLICKED"
};

const eventTitle =
eventNames[event] || event.toUpperCase();

// Telegram message
const message =
`📄 <b>DOCUMENT ACTIVITY</b>

🔔 <b>Event:</b> ${eventTitle}
💻 <b>Device:</b> ${device}
🌍 <b>Country:</b> ${country}
🌐 <b>IP:</b> ${ip}
🕐 <b>Time:</b> ${time}
📁 <b>Page:</b> ${page}`;

// Telegram credentials from Vercel Environment Variables
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!botToken || !chatId) {
return res.status(500).json({
success: false,
error: "Telegram configuration missing"
});
}

// Send to Telegram
const telegramResponse = await fetch(
`https://api.telegram.org/bot${botToken}/sendMessage`,
{
method: "POST",
headers: {
"Content-Type":
"application/json"
},
body: JSON.stringify({
chat_id: chatId,
text: message,
parse_mode: "HTML"
})
}
);

if (!telegramResponse.ok) {
return res.status(500).json({
success: false,
error: "Telegram request failed"
});
}

return res.status(200).json({
success: true,
event: eventTitle,
country: country
});

} catch (error) {
return res.status(500).json({
success: false,
error: "Server error"
});
}
}
