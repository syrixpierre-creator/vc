/** A business rule refused the operation. The HTTP layer turns it into `{error: code}` with `status` (409 by default). */
export class DomainError extends Error {
  code: string;
  status: number;
  constructor(code: string, status = 409) { super(code); this.code = code; this.status = status; }
}
