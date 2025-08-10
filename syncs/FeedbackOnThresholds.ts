import { actions, Frames, Vars } from "../engine/mod.ts";
import { AggregatorConcept } from "../concepts/AggregatorConcept.ts";
import { FeedbackConcept } from "../concepts/FeedbackConcept.ts";
import { NotificationConcept } from "../concepts/NotificationConcept.ts";

export const FeedbackOnThresholds = (
  Aggregator: AggregatorConcept,
  Feedback: FeedbackConcept,
  Notification: NotificationConcept,
) => ({ avgStudentCount, avgPhoneUsers, phoneUseRatio, rising, summary }: Vars) => ({
  when: actions([
    // Fire after each accumulation
    (Aggregator as any).accumulate, {}, { snapshotId: Symbol("snapshotId") }
  ]),
  where: (frames: Frames) =>
    frames
      .query((Aggregator as any)._windowStats, { seconds: 60 }, { avgStudentCount, avgPhoneUsers, phoneUseRatio, rising })
      .filter(($) => $[phoneUseRatio] >= 0.2 || $[rising] === true)
      .map((frame) => ({
        ...frame,
        [summary]: `phones=${String(Math.round(frame[avgPhoneUsers] as number))}, ratio=${(frame[phoneUseRatio] as number).toFixed(2)}${(frame[rising] ? " (rising)" : "")}`
      })),
  then: actions(
    [ (Feedback as any).generate, { avgStudentCount, avgPhoneUsers, phoneUseRatio, rising } ],
    [ (Notification as any).notify, { message: summary } ]
  )
});

