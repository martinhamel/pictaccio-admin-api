import { useContainer as routingControllerUseContainer } from '@loufa/routing-controllers';
import { useContainer as typeormUseContainer } from 'typeorm';
import { Container } from 'typedi';
import { LoaderInterface } from '../bootstrap';
import '../database/subscribers/json_subscriber';

export const typediLoader: LoaderInterface = async (): Promise<any> => {
    routingControllerUseContainer(Container);
    typeormUseContainer(Container);
};
