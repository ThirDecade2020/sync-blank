import { Empty } from "../engine/mod.ts";

export class NotificationConcept {
  public messages: { ts: number; message: string }[] = [];

  notify({ message }: { message: string }) {
    const row = { ts: Date.now(), message };
    this.messages.push(row);
    // MVP: console output
    console.log("[Teacher Notice]", message);
    return { message };
  }

  _getMessages(_: Empty) {
    return this.messages.map(m => ({ ts: m.ts, message: m.message }));
  }
}

