import { Bootstraper } from './bootstraper';

export { loaderState } from './bootstraper';
export { exportState } from './export_state_decorator';
export { LoaderInterface } from './loader_interface';
export { LoaderState } from './loader_state';
export { onExit } from './on_exit';

export function bootstrap(loaders: any[]): Promise<any> {
    const bootstrapper = new Bootstraper(loaders);

    return bootstrapper.run();
}
