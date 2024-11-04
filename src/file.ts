import fs from "fs";
import readline from "readline";
import FileOpException from "./exceptions/FileOpenException";
import {FileDescriptor, FileOpenMethod, OPERATIONS} from "./types/file";

/**
 * Represents a file object for opening, reading, writing, and closing files.
 */
export default class File {

  /**
   * Internal representation of the file descriptor and related information.
   */
  private file: FileDescriptor;

  /**
   * Creates a new File object with an empty descriptor.
   */
  constructor() {
    this.file = {
      path: "",
      mode: "r",
      fd: -1,
      rl: undefined,
    }
  }
  
  /**
   * Opens a file with the specified path and mode.
   * 
   * @param {string} path The path to the file to open.
   * @param {FileOpenMethod} mode The mode in which to open the file ("r" for read, "w" for write, etc.).
   * @throws {FileOpException} Thrown if an error occurs while opening the file.
   */
  public open(path: string, mode: FileOpenMethod): void {
    try {
      this.file.path = path;
      this.file.fd = fs.openSync(path, mode);
      if (mode === "r") {
        const fd = this.file.fd;
        const fileStream = fs.createReadStream(null as unknown as string, { fd });
  
        this.file.rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity
        });
  
        this.file.rl.on("close", () => {
          console.info("Close event called");
        })

        this.file.rl.on("line", (input:string) => {
          if (this.file.fd > 0 ) {
            console.info("Line event called");
            return input;
          }
        });
      
      }
      console.info(`File: ${this.file.path}(${this.file.fd}) opened`);
    } 
    catch (err) {
      console.error(`Error opening File: ${this.file.path}(${this.file.fd})`);
      throw new FileOpException(this.file.path, OPERATIONS.OPEN, err.message, err);
    }
  }

  /**
   * Closes the currently opened file.
   * 
   * @throws {FileOpException} Thrown if an error occurs while closing the file.
   */
  public close() {
    try {
      if (this.file.rl) {
        this.file.rl.close();
      }
      else {
        fs.closeSync(this.file.fd);
      }
      this.file.path = "";
      this.file.fd = -1;
      this.file.rl = undefined;
      console.info(`File: ${this.file.path}(${this.file.fd}) closed`);
    }
    catch (err) {
      console.error(`Error closing File: ${this.file.path}(${this.file.fd})`);
      throw new FileOpException(this.file.path, OPERATIONS.CLOSE, err.message, err);
    }
  }

  /**
   * Writes the provided data string to the opened file.
   * 
   * @param {string} data The data to write to the file.
   * @returns {number} The number of bytes written to the file.
   * @throws {FileOpException} Thrown if an error occurs while writing to the file.
   */
  public writeToFile(data: string): number {
    try {
      const buffer = Buffer.from(`${data}\n`);
      const written = fs.writeSync(this.file.fd, buffer, 0, buffer.length, null);
      return written;
    } 
    catch (err) {
      throw new FileOpException(this.file.path, OPERATIONS.WRITE, err.message, err);
    }
  }

  /**
   * Asynchronously reads lines from the opened file one at a time.
   * 
   * @throws {FileOpException} Thrown if the file is not open for reading.
   * @yields {string} The next line read from the file.
   */
  public async *readLine() {
    if (!this.file.rl) {
      return; // should throw ex
    }
    for await (const line of this.file.rl) {
      if (this.file.rl) {
        yield line;
      }
    }
  }
}
