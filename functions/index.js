const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onCall } = require("firebase-functions/v2/https");
const { onValueWritten } = require("firebase-functions/v2/database");
const admin = require("firebase-admin");
const https = require("https");

admin.initializeApp();

const ONESIGNAL_APP_ID = "a8d87e84-ebe4-454e-94be-e6e0da23283d";
const ONESIGNAL_API_KEY = "os_v2_app_vdmh5bhl4rcu5ff643qnuizihvfjgwg2s5our5ms4vimukqlfn73rfoyhmamqd6uwxw57vecgxlwamuehuwes5yc3nmjtr6pdmdo7zi";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

async function sendPushNotification(title, message) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      included_segments: ["All"],
      headings: { fr: title, en: title },
      contents: { fr: message, en: message },
      url: "https://localperf.netlify.app",
      web_url: "https://localperf.netlify.app",
    });

    const options = {
      hostname: "onesignal.com",
      path: "/api/v1/notifications",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${ONESIGNAL_API_KEY}`,
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve(JSON.parse(data)));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function buildSummary() {
  const db = admin.database();
  const today = todayStr();
  const snapshot = await db.ref("results").once("value");
  const data = snapshot.val() || {};

  let totalSig = 0, agenciesCount = 0, topAgency = null, topCount = 0;

  Object.entries(data).forEach(([key, days]) => {
    const entry = days[today];
    if (!entry) return;
    agenciesCount++;
    const sigs = entry.signatures || 0;
    totalSig += sigs;
    if (sigs > topCount) { topCount = sigs; topAgency = entry.agency || key; }
  });

  return { totalSig, agenciesCount, topAgency, topCount };
}

// ── Notification auto 19h ────────────────
exports.notificationQuotidienne = onSchedule(
  { schedule: "0 19 * * *", timeZone: "Europe/Paris", region: "europe-west1" },
  async () => {
    const { totalSig, agenciesCount, topAgency, topCount } = await buildSummary();
    const d = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    const title = `🏆 Résultats du ${d}`;
    let msg = `${totalSig} contrat${totalSig > 1 ? "s" : ""} signés · ${agenciesCount} agences`;
    if (topAgency) msg += ` · 🥇 ${topAgency} (${topCount})`;
    await sendPushNotification(title, msg);
  }
);

// ── Envoi manuel depuis l'appli ──────────
exports.envoyerNotificationMaintenant = onCall(
  { region: "europe-west1" },
  async (request) => {
    const { totalSig, agenciesCount, topAgency, topCount } = await buildSummary();
    const d = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    const title = request.data?.title || `🏆 Résultats du ${d}`;
    let msg = request.data?.message || `${totalSig} contrat${totalSig > 1 ? "s" : ""} signés · ${agenciesCount} agences`;
    if (topAgency && !request.data?.message) msg += ` · 🥇 ${topAgency} (${topCount})`;
    const result = await sendPushNotification(title, msg);
    return { success: true, result };
  }
);

// ── Notification quand tous les DA ont saisi ──
exports.checkAllAgenciesSoumises = onValueWritten(
  { ref: "/results/{agencyKey}/{date}", region: "europe-west1" },
  async (event) => {
    const today = todayStr();
    if (event.params.date !== today) return null;

    const db = admin.database();
    const snapshot = await db.ref("results").once("value");
    const data = snapshot.val() || {};

    const TOTAL_AGENCES = 21;
    const saisi = Object.values(data).filter(days => days[today]).length;

    if (saisi >= TOTAL_AGENCES) {
      const { totalSig, topAgency, topCount } = await buildSummary();
      await sendPushNotification(
        "✅ Tous les résultats sont là !",
        `${totalSig} contrats aujourd'hui · 🥇 ${topAgency} (${topCount}) · Voir le classement`
      );
    }
    return null;
  }
);
