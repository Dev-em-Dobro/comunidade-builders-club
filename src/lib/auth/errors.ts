export class AuthError extends Error {
  override readonly name = "AuthError";
  constructor(message: string) {
    super(message);
  }
}

export class ForbiddenError extends Error {
  override readonly name = "ForbiddenError";
  constructor(message: string) {
    super(message);
  }
}
