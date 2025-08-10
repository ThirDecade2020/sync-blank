import { Empty } from "../engine/mod.ts";

export class StreamConcept {
  private running = false;
  private latestFrame: { frameId: string; ts: number } | null = null;

  start(_: Empty) {
    this.running = true;
    return { running: this.running };
  }

  stop(_: Empty) {
    this.running = false;
    return { running: this.running };
  }

  frame({ frameId, ts, dataRef }: { frameId: string; ts: number; dataRef?: string }) {
    if (!this.running) this.running = true; // tolerate late start
    this.latestFrame = { frameId, ts };
    return { frameId };
  }

  _latest(_: Empty) {
    return this.latestFrame ? [this.latestFrame] : [];
  }
}

