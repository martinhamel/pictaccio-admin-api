import { spawn, exec } from 'child_process';

const FILE_EXE_PATH = process.platform === 'win32'
    ? 'C:\\Program Files (x86)\\GnuWin32\\bin\\file.exe'
    : '/usr/bin/file';
const FILE_CAPTURE_REGEX = /^(?:.*?[:;])?(.*?),/i;
const FILE_TYPES = [
    'PNG image data',
    'JPEG image data',
    'GIF image data',
    'SVG Scalable Vector Graphics image'
] as const;

type FileTypeKey = typeof FILE_TYPES[number];

const FILE_TYPES_MAPPINGS: Record<FileTypeKey, { ext: string; type: string; mime: string }> = {
    'PNG image data': { 'ext': 'png', 'type': 'image', 'mime': 'image/png' },
    'JPEG image data': { 'ext': 'jpeg', 'type': 'image', 'mime': 'image/jpeg' },
    'GIF image data': { 'ext': 'gif', 'type': 'image', 'mime': 'image/gif' },
    'SVG Scalable Vector Graphics image': { 'ext': 'svg', 'type': 'image', 'mime': 'image/svg+xml' }
};

export function checkFileMimeType(file: string | Buffer): Promise<string | null> {
    return new Promise((resolve, reject) => {
        let stdout = '';
        // Use exec if file is a string (path), spawn if Buffer (content)
        if (typeof file === 'string') {
            exec(`"${FILE_EXE_PATH}" -b "${file}"`, (err, stdoutExec) => {
                if (err) {
                    reject(new Error(`Error executing ${FILE_EXE_PATH}`));
                    return;
                }
                const match = stdoutExec.match(FILE_CAPTURE_REGEX);
                const type = match && match[1] ? match[1].trim() : null;
                if (type && (FILE_TYPES as readonly string[]).includes(type)) {
                    resolve(FILE_TYPES_MAPPINGS[type as FileTypeKey].mime);
                } else {
                    resolve(null);
                }
            });
        } else {
            const fileProcess = spawn(FILE_EXE_PATH, ['-b', '-']);
            if (fileProcess && fileProcess.stdout && fileProcess.stdin) {
                fileProcess.stdout.addListener('data', (chunk: Buffer) => {
                    stdout += chunk.toString();
                });
                fileProcess.stdout.addListener('end', () => {
                    const match = stdout.match(FILE_CAPTURE_REGEX);
                    const type = match && match[1] ? match[1].trim() : null;
                    if (type && (FILE_TYPES as readonly string[]).includes(type)) {
                        resolve(FILE_TYPES_MAPPINGS[type as FileTypeKey].mime);
                    } else {
                        resolve(null);
                    }
                });
                fileProcess.stdin.addListener('error', (error) => {
                    if ((error as NodeJS.ErrnoException).code === 'EPIPE') {
                        return;
                    }
                    reject(error);
                });
                fileProcess.stdin.write(file);
                fileProcess.stdin.end();
            } else {
                reject(new Error('Failed to spawn file process'));
            }
        }
    });
}
