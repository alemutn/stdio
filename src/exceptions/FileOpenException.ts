import {OPERATIONS} from "../types/file";
import BaseError from "./base-error";

export default class FileOpException extends BaseError {

  constructor(private path: string, private op: OPERATIONS, description: string, origError?: Error) {
    super(description, origError);
  }

  public getMessage(): string {
    return `Error al intentar ${this.op} el archivo: ${this.path}. ${this.message}`;
  }

}
