import { actions, Frames, Vars } from "../engine/mod.ts";
import { APIConcept } from "../concepts/APIConcept.ts";
import { AggregatorConcept } from "../concepts/AggregatorConcept.ts";
import { FeedbackConcept } from "../concepts/FeedbackConcept.ts";

export const ServeLatest = (
  API: APIConcept,
  Aggregator: AggregatorConcept,
  Feedback: FeedbackConcept,
) => ({ request, stats, latest }: Vars) => ({
  when: actions([
    (API as any).request, { method: "GET", path: "/metrics/latest" }, { request }
  ]),
  where: (frames: Frames) =>
    frames
      .query((Aggregator as any)._windowStats, { seconds: 60 }, { stats })
      .query((Feedback as any)._latest, {}, { latest }),
  then: actions([
    (API as any).response, { request, output: { stats, latest } }
  ])
});

