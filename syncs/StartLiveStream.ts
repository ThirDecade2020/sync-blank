import { actions, Vars } from "../engine/mod.ts";
import { APIConcept } from "../concepts/APIConcept.ts";
import { StreamConcept } from "../concepts/StreamConcept.ts";
import { NotificationConcept } from "../concepts/NotificationConcept.ts";

export const StartLiveStream = (
  API: APIConcept,
  Stream: StreamConcept,
  Notification: NotificationConcept,
) => ({ request }: Vars) => ({
  when: actions([
    (API as any).request, { method: "POST", path: "/streams/start" }, { request }
  ]),
  then: actions(
    [ (Stream as any).start, {} ],
    [ (Notification as any).notify, { message: "Stream started" } ]
  )
});

