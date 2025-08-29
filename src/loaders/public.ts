import { ConfigSchema } from '../core/config_schema';
import express, { Express } from 'express';
import { Container } from 'typedi';
import { LoaderInterface } from '../bootstrap';

export const publicLoader: LoaderInterface = async (): Promise<any> => {
    const config = Container.get<ConfigSchema>('config');
    const app = Container.get<Express>('express.app');

    app.use(express.static(config.http.servers.web.dirs.public.onDisk));
};
