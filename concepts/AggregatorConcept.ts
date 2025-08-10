import { Empty } from "../engine/mod.ts";

function now() { return Date.now(); }

export class AggregatorConcept {
  private snapshots: { snapshotId: string; ts: number; studentCount: number; phoneUsers: number }[] = [];
  private seq = 0;

  accumulate({ frameId, studentCount, phoneUsers }: { frameId: string; studentCount: number; phoneUsers: number }) {
    const snapshotId = `s${this.seq++}`;
    this.snapshots.push({ snapshotId, ts: now(), studentCount, phoneUsers });
    // keep only last 10 minutes of data
    const cutoff = now() - 10 * 60 * 1000;
    this.snapshots = this.snapshots.filter(s => s.ts >= cutoff);
    return { snapshotId };
  }

  _windowStats({ seconds }: { seconds: number }) {
    const cutoff = now() - seconds * 1000;
    const window = this.snapshots.filter(s => s.ts >= cutoff);
    if (window.length === 0) return [] as Array<{ avgStudentCount: number; avgPhoneUsers: number; phoneUseRatio: number; rising: boolean }>;

    const sumStudents = window.reduce((a, s) => a + s.studentCount, 0);
    const sumPhones = window.reduce((a, s) => a + s.phoneUsers, 0);
    const avgStudentCount = sumStudents / window.length;
    const avgPhoneUsers = sumPhones / window.length;
    const phoneUseRatio = avgStudentCount > 0 ? avgPhoneUsers / avgStudentCount : 0;

    // Simple rising check: last 3 phone counts strictly increasing
    const last = window.slice(-3).map(s => s.phoneUsers);
    const rising = last.length === 3 && last[0] < last[1] && last[1] < last[2];

    return [{ avgStudentCount, avgPhoneUsers, phoneUseRatio, rising }];
  }
}

