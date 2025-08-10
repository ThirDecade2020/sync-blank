import { Empty } from "../engine/mod.ts";

export class VisionConcept {
  private counter = 0;
  private rows = new Map<string, { frameId: string; studentCount: number; phoneUsers: number }>();

  analyzeFrame({ frameId }: { frameId: string }) {
    // MVP deterministic stub: fixed 25 students; phone users oscillate 0..8
    const studentCount = 25;
    const phoneUsers = Math.max(0, Math.min(8, (this.counter % 10) - 1));
    this.counter++;

    const row = { frameId, studentCount, phoneUsers };
    this.rows.set(frameId, row);
    return row;
  }

  _getDetections({ frameId }: { frameId: string }) {
    const row = this.rows.get(frameId);
    return row ? [row] : [];
  }
}

