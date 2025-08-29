import { useContainer as routingControllerUseContainer } from '@loufa/routing-controllers';
import { Container } from 'typedi';
import { LoaderInterface } from '../bootstrap';

export const typediLoader: LoaderInterface = async (): Promise<any> => {
    routingControllerUseContainer(Container);
};
