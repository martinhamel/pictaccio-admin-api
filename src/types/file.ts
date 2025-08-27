export interface File extends Express.Multer.File {
    name: string;
    data: Buffer;
    size: number;
    encoding: string;
    tempFilePath: string;
    truncated: false;
    mimetype: string;
    md5: string;
    mv: (filePath: string, callback?: (error: Error) => void) => Promise<void>;
}
