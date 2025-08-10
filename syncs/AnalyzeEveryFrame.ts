import { actions, Vars } from "../engine/mod.ts";
import { StreamConcept } from "../concepts/StreamConcept.ts";
import { VisionConcept } from "../concepts/VisionConcept.ts";

export const AnalyzeEveryFrame = (
  Stream: StreamConcept,
  Vision: VisionConcept,
) => ({ frameId }: Vars) => ({
  when: actions([
    (Stream as any).frame, { frameId }, { frameId }
  ]),
  then: actions([
    (Vision as any).analyzeFrame, { frameId }
  ])
});

