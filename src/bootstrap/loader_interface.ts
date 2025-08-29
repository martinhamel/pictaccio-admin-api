import { LoaderState } from '../bootstrap/loader_state';

export interface LoaderInterface {
    (state: LoaderState): Promise<any> | any;
}
