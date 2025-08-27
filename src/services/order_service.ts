import { isInteger } from '@loufa/loufairy';
import { TransactionalOrder } from '@pictaccio/admin-api/database/entities/transactional_order';
import { TransactionalTransaction } from '@pictaccio/admin-api/database/entities/transactional_transaction';
import { NotFoundError } from '@pictaccio/admin-api/errors/not_found_error';
import { ProductPhoto } from '@pictaccio/admin-api/http/shared/controllers/nested/product_photo';
import { TransactionInfo } from '@pictaccio/admin-api/http/shared/controllers/nested/transaction_info';
import { OrderCartItem, OrderCartItems } from '@pictaccio/admin-api/types/order_cart_item';
import { CartItem } from '@pictaccio/shared/src/types/cart_item';
import { OrderDescriptor } from '@pictaccio/shared/src/types/order_descriptor';
import { OrderMeta } from '@pictaccio/shared/src/types/order_meta';
import { OrderPhotoSelectionItem } from '@pictaccio/shared/src/types/order_photo_selection';
import { PhotoSelections } from '@pictaccio/shared/src/types/photo_selections';
import { PhotoVersionCollection } from '@pictaccio/shared/src/types/photo_version_collection';
import { Subject } from '@pictaccio/shared/src/types/subject';
import { SubjectGroup } from '@pictaccio/shared/src/types/subject_group';
import { Service } from 'typedi';

@Service('order')
export class OrderService {
    public async getOrders(orderIds: string[], includeMeta = false): Promise<OrderDescriptor[]> {
        const orders = await TransactionalOrder.getMany(orderIds, includeMeta);
        const transactions = await TransactionalTransaction.getManyByOrder(orderIds);

        if (transactions.length !== 0) {
            for (const order of orders) {
                order.transactions =
                    transactions.filter(row => row.order['id'] == order.id);
            }
        }

        if (orderIds.length !== orders.length) {
            throw new NotFoundError('Order not found');
        }

        return Promise.all(orders.map(order => this._prepareOrderDescriptor(order, includeMeta)));
    }

    private _compileOrderProducts(cart: OrderCartItems): string[] {
        return cart
            ? Object.values(cart)
                .map(item => item.productId)
                .filter(id => isInteger(id))
            : [];
    }

    private async _makeCartItems(order: TransactionalOrder): Promise<CartItem[]> {
        return Object.entries(order.cart)
            .map(([itemId, item]: [string, OrderCartItem]) => ({
                cartItemId: itemId,
                productType: item.productType,
                customProductSelection: item.customProductSelection,
                productId: item.productId,
                comment: item.comment ?? '',
                quantity: item.quantity,
                productName: item.productName,
                productNameLocale: item.productNameLocale,
                productPrice: item.productPrice,
                subtotal: item.itemSubtotal,
                theme: item.theme && item.theme !== ''
                    ? item.theme
                    : null,
                themeLocale: item.themeLocale,
                productPhoto: this._makeProductPhotos(item),
                photos: this._makePhotos(order, item)
            }));
    }

    private async _makeOrderPhotos(order: TransactionalOrder): Promise<PhotoSelections> {
        return Object.fromEntries(
            Object.entries(order.photo_selection)
                .map(([id, photo]) => [id, {
                    itemType: photo.image.subjectId ? 'subject' : 'group',
                    backgroundProductionIdentifier: photo.background
                        ? photo.background.productionIdentifier
                        : null,
                    backgroundUrl: photo.background
                        ? photo.background.url
                        : null,
                    itemId: photo.image.subjectId ?? photo.image.groupId,
                    photoId: id,
                    photoUrl: photo.image.url
                }]
                )
        );
    }

    private async _makePhotoVersions(order: TransactionalOrder): Promise<PhotoVersionCollection> {
        const pre = [...order.subjects, ...order.subjectGroups];
        return Object.fromEntries(
            pre.map(subject => [subject.id, subject.versions]));
    }

    private _makePhotos(order: TransactionalOrder, item: OrderCartItem): string[] {
        return Object.entries(order.photo_selection)
            .filter(([id, _]) => item.selection.includes(id))
            .map(([id, photo]: [string, OrderPhotoSelectionItem]) => id);
    }

    private _makeProductPhotos(item: OrderCartItem): ProductPhoto {
        switch (item.productType) {
            case 'touchup':
                return {
                    theme: null,
                    url: '/img/touchups.webp'
                };

            case 'digital':
                return {
                    theme: null,
                    url: '/img/digitals.webp'
                };

            default:
                return {
                    theme: item.theme ?? null,
                    url: item.productImage
                };
        }
    }

    private async _makeSubjects(order: TransactionalOrder): Promise<Subject[]> {
        const subjects = order.subjects;
        return subjects.map(subject => ({
            id: subject.id,
            code: subject.code,
            uniqueId: subject.unique_id,
            photos: subject.photos,
            name: subject.display_name,
            group: subject.group
        }));
    }

    private async _makeSubjectGroups(order: TransactionalOrder): Promise<SubjectGroup[]> {
        const subjectGroups = order.subjectGroups;
        return subjectGroups.map(group => ({
            id: group.id,
            photos: group.photos,
            name: group.group
        }));
    }

    private _makeTransactions(order: TransactionalOrder): TransactionInfo[] {
        return Array.isArray(order.transactions)
            ? order.transactions.map(transaction => {
                return {
                    code: transaction.transaction_code,
                    success: transaction.successful,
                    type: transaction.payment_module
                };
            })
            : [];
    }

    private async _prepareOrderDescriptor(order: TransactionalOrder, includeMeta: boolean): Promise<OrderDescriptor> {
        const meta: OrderMeta = {};

        if (includeMeta) {
            meta.assignmentUserId = order.assignment?.user?.id;
            meta.productionStatus = order.productionStatus?.status ?? 'pending';
        }

        return {
            id: order.id,
            language: order.flags.customerLocale,
            session: {
                id: order.session.id,
                workflow: {
                    id: order.session.workflow.id,
                    internalName: order.session.workflow.internal_name,
                    options: order.session.workflow.options
                },
                datePublish: order.session.publish_date,
                dateExpire: order.session.expire_date,
                internalName: order.session.internal_name,
                options: order.session.options
            },
            cartItems: await this._makeCartItems(order),
            comment: order.comment,
            contact: {
                firstName: order.contact?.first_name,
                lastName: order.contact?.last_name,
                email: order.contact?.email,
                streetAddress1: order.contact?.street_address_1,
                streetAddress2: order.contact?.street_address_2,
                city: order.contact?.city,
                region: order.contact?.region,
                postalCode: order.contact?.postal_code,
                phone: order.contact?.phone,
                country: order.contact?.country,
                newsletter: order.contact?.newsletter
            },
            photos: await this._makeOrderPhotos(order),
            photoVersions: await this._makePhotoVersions(order),
            deliveryOption: {
                id: order.deliveryOption?.id,
                internalName: order.deliveryOption?.internal_name,
                nameLocale: order.deliveryOption?.name_locale,
                basePrice: order.deliveryOption?.base_price,
                leadTime: order.deliveryOption?.lead_time,
                method: order.deliveryOption?.method,
                options: order.deliveryOption?.options
            },
            subjects: await this._makeSubjects(order),
            subjectGroups: await this._makeSubjectGroups(order),
            transaction: {
                subtotal: order.sale_subtotal,
                promo: order.flags.promo
                    ? order.flags.promo.amount
                    : '0',
                shipping: order.sale_delivery_price,
                taxes: order.sale_taxes,
                total: order.sale_total,
                transactions: this._makeTransactions(order)
            },
            date: order.created_on,
            ...meta
        };
    }
}
