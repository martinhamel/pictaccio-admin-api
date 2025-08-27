import { useContainer as routingControllerUseContainer } from '@loufa/routing-controllers';
import { Container } from 'typedi';
import { LoaderInterface } from '@pictaccio/admin-api/bootstrap';

export const typediLoader: LoaderInterface = async (): Promise<any> => {
    routingControllerUseContainer(Container);
};
