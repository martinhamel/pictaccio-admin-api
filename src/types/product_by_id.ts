import { TransactionalProduct } from '../database/entities/transactional_product';

export type ProductById = { [key: number]: TransactionalProduct };
