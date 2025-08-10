import { Logging, SyncConcept } from "./engine/mod.ts";
import { APIConcept } from "./concepts/APIConcept.ts";
import { StreamConcept } from "./concepts/StreamConcept.ts";
import { VisionConcept } from "./concepts/VisionConcept.ts";
import { AggregatorConcept } from "./concepts/AggregatorConcept.ts";
import { FeedbackConcept } from "./concepts/FeedbackConcept.ts";
import { NotificationConcept } from "./concepts/NotificationConcept.ts";

import { StartLiveStream } from "./syncs/StartLiveStream.ts";
import { AnalyzeEveryFrame } from "./syncs/AnalyzeEveryFrame.ts";
import { AggregateOnDetection } from "./syncs/AggregateOnDetection.ts";
import { FeedbackOnThresholds } from "./syncs/FeedbackOnThresholds.ts";
import { ServeLatest } from "./syncs/ServeLatest.ts";

// Initialize engine
const Sync = new SyncConcept();
Sync.logging = Logging.TRACE;

// Create and instrument concepts
const concepts = {
  API: new APIConcept(),
  Stream: new StreamConcept(),
  Vision: new VisionConcept(),
  Aggregator: new AggregatorConcept(),
  Feedback: new FeedbackConcept(),
  Notification: new NotificationConcept(),
};
const { API, Stream, Vision, Aggregator, Feedback, Notification } = Sync.instrument(concepts);

// Register syncs
Sync.register({
  StartLiveStream: StartLiveStream(API, Stream, Notification),
  AnalyzeEveryFrame: AnalyzeEveryFrame(Stream, Vision),
  AggregateOnDetection: AggregateOnDetection(Vision, Aggregator),
  FeedbackOnThresholds: FeedbackOnThresholds(Aggregator, Feedback, Notification),
  ServeLatest: ServeLatest(API, Aggregator, Feedback),
});

// --- Demo runner (simulates a stream for 5 seconds) ---
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

// start stream
const reqId = "req-start-1";
await API.request({ request: reqId, method: "POST", path: "/streams/start", input: {} });

// push some frames (as if coming from a camera loop)
for (let i = 0; i < 50; i++) {
  await Stream.frame({ frameId: `f${i}`, ts: Date.now(), dataRef: "mvp" });
  await sleep(100); // ~10 FPS simulated
}

// check latest metrics via API
const checkId = "req-metrics-1";
await API.request({ request: checkId, method: "GET", path: "/metrics/latest", input: {} });
const out = API._get({ request: checkId });
console.log("Latest API output:", out[0]?.output);

