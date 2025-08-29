import { ConfigSchema } from '../core/config_schema';
import { mkdir } from 'node:fs/promises';
import { Container } from 'typedi';
import { LoaderInterface } from '../bootstrap';

export const foldersLoader: LoaderInterface = async (): Promise<any> => {
    const config = Container.get<ConfigSchema>('config');

    for (const dir of Object.values(config.app.dirs)) {
        try {
            await mkdir(dir, { recursive: true });
        } catch (e) {
            // Pass
        }
    }
};
