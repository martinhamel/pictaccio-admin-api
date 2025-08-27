import { LoaderState } from '@pictaccio/admin-api/bootstrap/loader_state';

export interface LoaderInterface {
    (state: LoaderState): Promise<any> | any;
}
