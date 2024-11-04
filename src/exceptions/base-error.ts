export default abstract class BaseError extends Error {

  public cause: Error | undefined;

  constructor(description: string, origError?: Error) {
    super(description);
    this.cause = origError;
    this.stack = origError?.stack;
  }

  public abstract getMessage(): string;

}
