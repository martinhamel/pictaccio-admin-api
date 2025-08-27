import { spawn } from 'node:child_process';

/**
 * Create a promise that times out after msTimeout
 * @param msTimeout Number of ms until the promise times out
 * @param promise Promise to wrap
 * @returns Wrapped promise
 */
export function createPromiseTimeout(msTimeout: number, promise: Promise<unknown>): Promise<unknown> {
    const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('timeout');
        }, msTimeout);
    });

    return Promise.race([
        timeoutPromise,
        promise
    ]);
}

/**
 * Format a PEM certificate string if it's on a single line
 * @param certificate
 */
export function formatPEMString(certificate: string): string {
    if (typeof certificate === 'string' && !certificate.includes('\n')) {
        return certificate.replace(/\\n/g, '\n');
    }

    return certificate;
}

/**
 * Get API server version from environment variables or fallback to git tag then branch name
 */
export async function getApiServerVersion(): Promise<string> {
    if (process.env.APP_BUILD !== undefined) {
        return process.env.APP_BUILD;
    }

    const gitTag = await getCurrentGitTag();
    if (gitTag !== '') {
        return gitTag;
    }

    return await getCurrentBranchName();
}

/**
 * Get current branch name
 */
export function getCurrentBranchName(): Promise<string> {
    return new Promise((resolve, reject) => {
        const git = spawn('git', ['describe', '--contains', '--all', 'HEAD'], {stdio: ['pipe', 'pipe', 'pipe']});
        let stdout = '';
        let stderr = '';

        if (git && git.stdout) {
            git.stderr.addListener('data', (chunk) => {
                stderr += chunk.toString();
            });
            git.stdout.addListener('data', (chunk) => {
                stdout += chunk.toString();
            });
            git.stdout.addListener('end', () => {
                if (stderr !== '') {
                    resolve('');
                } else {
                    resolve(stdout.endsWith('\n')
                        ? stdout.slice(0, -1)
                        : stdout
                    );
                }
            });
        }
    });
}

/**
 * Get git tag from current commit or an empty string
 */
export function getCurrentGitTag(): Promise<string> {
    return new Promise((resolve, reject) => {
        const git = spawn('git', ['describe', '--contains', '--tags'], {stdio: ['pipe', 'pipe', 'pipe']});
        let stdout = '';
        let stderr = '';

        if (git && git.stdout) {
            git.stderr.addListener('data', (chunk) => {
                stderr += chunk.toString();
            });
            git.stdout.addListener('data', (chunk) => {
                stdout += chunk.toString();
            });
            git.stdout.addListener('end', () => {
                if (stderr !== '') {
                    resolve('');
                } else {
                    resolve(stdout.endsWith('\n')
                        ? stdout.slice(0, -1)
                        : stdout
                    );
                }
            });
        }
    });
}
