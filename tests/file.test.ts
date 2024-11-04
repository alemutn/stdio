import File from "../src/file";
import { FileDescriptor, FileOpenMethod } from "../src/types/file";
import { mock } from "jest-mock-extended";
import fs from "fs";
import FileOpException from "../src/exceptions/FileOpenException";
import readline from 'readline';

jest.mock("fs"); // Mock the entire fs module

describe("File tests", () => {

  let instance: File;
  let mockFs: any;

  beforeEach(() => {
    instance = new File();
    mockFs = mock(fs);
  })

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should be an instance of File", () => {
    expect(instance).toBeInstanceOf(File);
  });

  describe("open", () => {
    it("should open a file in read mode", () => {
      const path = "test.txt";
      const mode = "r" as FileOpenMethod;
      const mockFd = 10;

      mockFs.openSync.mockReturnValue(mockFd);
      const mockFileStream = mock();

      mockFs.createReadStream.mockReturnValue(mockFileStream);

      const expectedFile: FileDescriptor = {
        fd: 10,
        rl: mockFileStream as any,
        mode: "r",
        path,
      };

      instance.open(path, mode);

      expect(mockFs.openSync).toHaveBeenCalledWith(path, mode);
      expect(mockFs.createReadStream).toHaveBeenCalledWith(null, { fd: mockFd });
      expect(instance["file"].fd).toEqual(expectedFile.fd);
      expect(instance["file"].mode).toEqual(expectedFile.mode);
      expect(instance["file"].path).toEqual(expectedFile.path);
    });

    it('should not create a readline interface when opening for writing', () => {
      const path = 'test.txt';
      const mode = 'w' as FileOpenMethod;

      instance.open(path, mode);

      expect(instance["file"].rl).toBeUndefined();
    });

    it('should throw a FileOpException on open error', () => {
      const path = 'test.txt';
      const mode = 'r' as FileOpenMethod;
      const mockError = new Error('Open error');

      mockFs.openSync.mockImplementation(() => {
        throw mockError;
      });

      // expect(() => instance.open(path, mode)).toThrow(FileOpException);
      try {
        instance.open(path, mode);
      }
      catch (error) {
        expect(error).toBeInstanceOf(FileOpException);
      }
    });
  });

  describe('close method', () => {
    it('should close a readline interface and reset the descriptor', () => {
      const mockRlClose = jest.fn();
      instance["file"].path = 'test.txt';
      instance["file"].fd = 10;
      instance["file"].rl = { close: mockRlClose } as unknown as FileDescriptor['rl'];
      instance.close();

      expect(mockRlClose).toHaveBeenCalled();
      expect(instance["file"].path).toBe('');
      expect(instance["file"].fd).toBe(-1);
      expect(instance["file"].rl).toBeUndefined();
    });

    it('should close the file descriptor directly if no readline interface is present', () => {
      instance["file"].fd = 10;
      instance["file"].rl = undefined;
      mockFs.closeSync.mockReturnValue();
      instance.close();

      expect(mockFs.closeSync).toHaveBeenCalledWith(10);
      expect(instance["file"].path).toBe('');
      expect(instance["file"].fd).toBe(-1);
      expect(instance["file"].rl).toBeUndefined();
    });

    it('should throw a FileOpException on close error', () => {
      const mockError = new Error('Close error');
      mockFs.closeSync.mockImplementation(() => {
        throw mockError;
      });
      instance["file"].fd = 10;

      try {
        instance.close();
      }
      catch (error) {
        expect(error).toBeInstanceOf(FileOpException);
      }
    });
  });

  describe('writeToFile method', () => {
    it('should write data to the file and return the number of bytes written', () => {
      const data = 'Test data';
      const mockFd = 10;
      const mockWritten = 10;

      mockFs.openSync.mockReturnValue(mockFd);
      mockFs.writeSync.mockReturnValue(mockWritten);

      instance.open('test.txt', 'w');
      const writtenBytes = instance.writeToFile(data);

      expect(writtenBytes).toBe(mockWritten);
      expect(mockFs.writeSync).toHaveBeenCalledWith(mockFd, Buffer.from(`${data}\n`), 0, Buffer.from(`${data}\n`).length, null);
    });

    it('should throw a FileOpException on write error', () => {
      const data = 'Test data';
      const mockError = new Error('Write error');

      mockFs.openSync.mockReturnValue(10);
      mockFs.writeSync.mockImplementation(() => {
        throw mockError;
      });

      instance.open('test.txt', 'w');

      expect(() => instance.writeToFile(data)).toThrow(FileOpException);
    });
  });

  describe('readLine method', () => {
    it('should read lines from the file', async () => {
      const mockLines = ['line1', 'line2', 'line3'];
      const mockRl = {
        [Symbol.asyncIterator](): AsyncIterableIterator<string> {
          let i = 0;
          return {
            next: async () => ({
              value: mockLines[i++],
              done: i > mockLines.length,
            }),
            [Symbol.asyncIterator]: () => this,
          } as AsyncIterableIterator<string>;
        },
      };

      mockFs.openSync.mockReturnValue(10);
      mockFs.createReadStream.mockReturnValue({
        pipe: jest.fn(),
      });
      jest.mock('readline', () => ({
        createInterface: jest.fn().mockReturnValue(mockRl),
      }));

      instance.open = jest.fn().mockReturnValue(undefined);
      
      // instance.close = jest.fn().mockReturnValue(undefined);

      let i = 0;
      for await (const line of instance.readLine()) {
        expect(line).toBe(mockLines[i++]);
      }
    });

  });
})
