export function onExit(callable: (reason: string, exitCode: number|string, error?: Error) => void): void {
    process.on('exit', exitCode => callable('exit', exitCode));
    process.on('SIGINT', signal => callable('SIGINT', signal));
    process.on('SIGUSR1', signal => callable('SIGUSR1', signal));
    process.on('SIGUSR2', signal => callable('SIGUSR2', signal));
    process.on('uncaughtException', error => callable('uncaught-exception', 0, error));
}