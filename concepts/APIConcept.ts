type Json = Record<string, unknown>;

type RequestRow = {
  request: string;
  method: string;
  path: string;
  input: Json;
  output?: Json;
};

export class APIConcept {
  private requests = new Map<string, RequestRow>();

  request({ request, method, path, input }: { request: string; method: string; path: string; input: Json }) {
    this.requests.set(request, { request, method, path, input });
    return { request };
  }

  response({ request, output }: { request: string; output: Json }) {
    const row = this.requests.get(request);
    if (!row) throw new Error(`API.request not found: ${request}`);
    row.output = output;
    this.requests.set(request, row);
    return { request };
  }

  _get({ request }: { request: string }) {
    const row = this.requests.get(request);
    if (!row || row.output === undefined) return [] as Array<RequestRow & { output: Json }>;
    return [{ ...row, output: row.output }];
  }
}

