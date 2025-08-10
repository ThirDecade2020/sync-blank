// server.ts — Deno HTTP server + engine wiring (client-side detection mode)
import { Logging, SyncConcept } from "./engine/mod.ts";
import { AggregatorConcept } from "./concepts/AggregatorConcept.ts";
import { FeedbackConcept } from "./concepts/FeedbackConcept.ts";
import { NotificationConcept } from "./concepts/NotificationConcept.ts";

// We don't need API/Stream/Vision concepts when detection runs in the browser.
// FeedbackOnThresholds fires on Aggregator.accumulate.
import { FeedbackOnThresholds } from "./syncs/FeedbackOnThresholds.ts";

// ----- Engine boot
const Sync = new SyncConcept();
// Quieter logs so it won't look like it's hanging
Sync.logging = Logging.OFF;

const concepts = {
  Aggregator: new AggregatorConcept(),
  Feedback: new FeedbackConcept(),
  Notification: new NotificationConcept(),
};
const { Aggregator, Feedback, Notification } = Sync.instrument(concepts);

Sync.register({
  FeedbackOnThresholds: FeedbackOnThresholds(Aggregator, Feedback, Notification),
});

// ----- Helpers
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
    },
  });
}
async function serveFile(path: string, type: string) {
  try {
    const file = await Deno.readFile(path);
    return new Response(file, { headers: { "content-type": type } });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}

// ----- HTTP routes
let streaming = false;

Deno.serve({ port: 8000 }, async (req) => {
  const url = new URL(req.url);
  const { pathname } = url;

  // Static UI
  if (req.method === "GET" && (pathname === "/" || pathname === "/index.html")) {
    return serveFile("./public/index.html", "text/html; charset=utf-8");
  }

  // Start/stop just toggle a flag (the browser does detection)
  if (req.method === "POST" && pathname === "/streams/start") {
    streaming = true;
    return json({ ok: true });
  }
  if (req.method === "POST" && pathname === "/streams/stop") {
    streaming = false;
    return json({ ok: true });
  }

  // Browser posts counts once per second
  if (req.method === "POST" && pathname === "/events/detection") {
    try {
      const { studentCount, phoneUsers } = await req.json();
      if (typeof studentCount !== "number" || typeof phoneUsers !== "number") {
        return json({ error: "Invalid payload" }, 400);
      }
      // Treat each post as a snapshot in the rolling window
      const frameId = crypto.randomUUID();
      await (Aggregator as any).accumulate({ frameId, studentCount, phoneUsers });
      return json({ ok: true });
    } catch (e) {
      return json({ error: String(e) }, 400);
    }
  }

  // Latest metrics + suggestions (read directly from queries)
  if (req.method === "GET" && pathname === "/metrics/latest") {
    const stats = (Aggregator as any)._windowStats({ seconds: 60 });
    const latest = (Feedback as any)._latest({});
    return json({ stats, latest });
  }

  return new Response("Not Found", { status: 404 });
});

console.log("🚀 UI: http://localhost:8000  (Start/Stop, boxes on video, live metrics)");

