import { Empty } from "../engine/mod.ts";

export class FeedbackConcept {
  private latest: { ts: number; suggestions: string[] } | null = null;

  generate({ avgStudentCount, avgPhoneUsers, phoneUseRatio, rising }: { avgStudentCount: number; avgPhoneUsers: number; phoneUseRatio: number; rising: boolean }) {
    const suggestions: string[] = [];

    if (phoneUseRatio >= 0.2) {
      suggestions.push("Phone use is high: switch to a 2-minute pair activity.");
    }
    if (rising) {
      suggestions.push("Phone use rising: insert a quick cold-call check-in.");
    }
    if (avgStudentCount > 0 && avgPhoneUsers >= Math.max(2, Math.round(0.1 * avgStudentCount))) {
      suggestions.push("Introduce a timed challenge to re-focus attention.");
    }
    // ✅ New low-phone-usage rule
    if (phoneUseRatio < 0.05) {
      suggestions.push("Great focus today — keep it up!");
    }

    if (suggestions.length === 0) {
      suggestions.push("Engagement looks steady. Keep current pace.");
    }

    this.latest = { ts: Date.now(), suggestions };
    return { ts: this.latest.ts };
  }

  _latest(_: Empty) {
    return this.latest ? [this.latest] : [];
  }
}

