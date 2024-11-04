import readline from "readline";

/**
 * Enumeration of file operations.
 */
export enum OPERATIONS {
  OPEN = "Abrir",
  CLOSE = "Cerrar",
  WRITE = "Escribir",
  READ = "Leer",
};

/**
 * Type representing the possible modes for opening a file.
 */
export type FileOpenMethod = "a" | "r" | "r+" | "w" | "w+";

/**
 * Interface describing a file descriptor.
 * 
 * @property {number} fd The file descriptor.
 * @property {string} mode The mode in which the file is opened.
 * @property {string} path The path to the file.
 * @property {readline.Interface | undefined} rl The readline interface for reading lines from the file.
 */
export interface FileDescriptor {
  fd: number,
  mode: string
  path: string,
  rl?: readline.Interface,
}

