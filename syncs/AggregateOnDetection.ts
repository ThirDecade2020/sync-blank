import { actions, Vars } from "../engine/mod.ts";
import { VisionConcept } from "../concepts/VisionConcept.ts";
import { AggregatorConcept } from "../concepts/AggregatorConcept.ts";

export const AggregateOnDetection = (
  Vision: VisionConcept,
  Aggregator: AggregatorConcept,
) => ({ frameId, studentCount, phoneUsers }: Vars) => ({
  when: actions([
    (Vision as any).analyzeFrame, { frameId }, { frameId, studentCount, phoneUsers }
  ]),
  then: actions([
    (Aggregator as any).accumulate, { frameId, studentCount, phoneUsers }
  ])
});

