export class AppError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
    this.name = "AppError";
  }
}
export class NotFoundError extends AppError {
  constructor(message = "Not found.") { super(message, 404); this.name = "NotFoundError"; }
}
export class ConflictError extends AppError {
  constructor(message: string) { super(message, 409); this.name = "ConflictError"; }
}
