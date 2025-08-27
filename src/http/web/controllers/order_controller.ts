import {
    Action,
    Authorized,
    BadRequestError,
    Body,
    CurrentUser,
    Get,
    JsonController,
    Post,
    QueryParam,
    QueryParams,
    Req, Res
} from '@loufa/routing-controllers';
import { ResponseSchema } from '@loufa/routing-controllers-openapi';
import { logger } from '@pictaccio/admin-api/core/logger';
import { httpCommonFields } from '@pictaccio/admin-api/core/logger_common';
import {
    TransactionalOrderPublishedPhoto
} from '@pictaccio/admin-api/database/entities/transactional_order_published_photo';
import { DataTable, fromReadRequest } from '@pictaccio/admin-api/database/helpers/data_table';
import { AdminOrderAssignment } from '@pictaccio/admin-api/database/entities/admin_order_assignment';
import { AdminOrderCheck } from '@pictaccio/admin-api/database/entities/admin_order_check';
import { AdminOrderComment } from '@pictaccio/admin-api/database/entities/admin_order_comment';
import { AdminOrderStatus } from '@pictaccio/admin-api/database/entities/admin_order_status';
import { AdminOrderPublishedPhoto } from '@pictaccio/admin-api/database/entities/admin_order_published_photo';
import { TransactionalContact } from '@pictaccio/admin-api/database/entities/transactional_contact';
import { TransactionalOrder } from '@pictaccio/admin-api/database/entities/transactional_order';
import { TransactionalSubject } from '@pictaccio/admin-api/database/entities/transactional_subject';
import { NotFoundError } from '@pictaccio/admin-api/errors/not_found_error';
import { PhotoPublish } from '@pictaccio/admin-api/http/shared/controllers/nested/photo_publish';
import { AddCommentRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/add_comment_request';
import { AssignOrderRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/assign_order_request';
import {
    DataTableReadBaseRequest
} from '@pictaccio/admin-api/http/shared/controllers/requests/data_table_read_base_request';
import { DeleteCommentRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/delete_comment_request';
import { EditCommentRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/edit_comment_request';
import { EditContactRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/edit_contact_request';
import { GetChecksResponse } from '@pictaccio/admin-api/http/shared/controllers/requests/get_checks_response';
import { GetCommentsRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/get_comments_request';
import {
    OrderNotifyCustomerRequest
} from '@pictaccio/admin-api/http/shared/controllers/requests/order_notify_customer_request';
import {
    PublishUnpublishOrderPhotosRequest
} from '@pictaccio/admin-api/http/shared/controllers/requests/publish_order_photos_request';
import { SetCheckRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/set_check_request';
import { SetOrderStatusRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/set_order_status_request';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';
import { DataTableBaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/data_table_base_response';
import { EditContactResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/edit_contact_response';
import { GetAssignedResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/get_assigned_response';
import { GetCommentsResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/get_comments_response';
import {
    GetOrderPublishPhotosResponse
} from '@pictaccio/admin-api/http/shared/controllers/responses/get_order_publish_photos_response';
import {
    GetOrderStatusResponse
} from '@pictaccio/admin-api/http/shared/controllers/responses/get_order_status_response';
import {
    NotifyCustomerResponse
} from '@pictaccio/admin-api/http/shared/controllers/responses/notify_customer_response';
import { PrintTokenResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/print_token_response';
import { ReadOrderResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/read_order_response';
import { SetCheckResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/set_check_response';
import { getFixedT } from '@pictaccio/admin-api/loaders/i18next';
import { AuthService } from '@pictaccio/admin-api/services/auth_service';
import CommunicationService from '@pictaccio/admin-api/services/communication_service';
import { OrderService } from '@pictaccio/admin-api/services/order_service';
import { Request } from '@pictaccio/admin-api/types/request';
import { User } from '@pictaccio/shared/src/types/user';
import { Language, Languages } from '@pictaccio/shared/src/types/language';
import { SpreadsheetExportFormat } from '@pictaccio/shared/src/types/spreadsheet_export_type';
import { toExcelUtf8Encoding } from '@loufa/loufairy';
import { Response } from 'express';
import { Inject, Service } from 'typedi';
import { In } from 'typeorm';

@Service()
@JsonController('/order')
export class OrderController {
    constructor(@Inject('auth') private readonly auth: AuthService,
        @Inject('order') private readonly order: OrderService,
        @Inject('communication') private readonly communication: CommunicationService) { }

    @Authorized('create:order-comment')
    @Post('/comment/add')
    @ResponseSchema(BaseResponse)
    public async addComment(@Body() body: AddCommentRequest,
        @CurrentUser() user: User,
        @Req() request: Request): Promise<BaseResponse> {
        logger.info(`User ${user.email} is adding comment to order ${body.orderId}`, {
            area: 'http/web',
            subarea: 'controller/order',
            action: 'order:add-comment',
            controller_action: 'addComment',
            src_user_id: user.id,
            src_user_email: user.email,
            order_id: body.orderId,
            ...httpCommonFields(request)
        });

        try {
            const order = await TransactionalOrder.findOne({ where: { id: body.orderId } });

            if (!order) {
                throw new NotFoundError(`Cannot find order id ${body.orderId}`);
            }

            await AdminOrderComment.addComment(body.orderId, {
                message: body.comment,
                userId: user.id
            });

            return {
                status: 'great-success'
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            logger.error(
                `Error while adding comment to order ${body.orderId}. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'order:add-comment',
                controller_action: 'addComment',
                src_user_id: request.user.id,
                src_user_email: request.user.email,
                order_id: body.orderId,
                stack: error.stack,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error',
                context: 'UNKNOWN_ERROR',
                correlationId: request.correlationId
            };
        }
    }

    @Authorized('update:order')
    @Post('/apply-check')
    @ResponseSchema(SetCheckResponse)
    public async applyCheck(@Body() body: SetCheckRequest,
        @Req() request: Request): Promise<SetCheckResponse> {
        logger.info(`User ${request.user.email} is setting check for order ${body.orderId}`, {
            area: 'http/web',
            subarea: 'controller/order',
            action: 'apply-check',
            controller_action: 'applyCheck',
            src_user_id: request.user.id,
            src_user_email: request.user.email,
            order_id: body.orderId,
            photo_id: body.photoId,
            ...httpCommonFields(request)
        });

        try {
            const order = await TransactionalOrder.findOne(
                { where: { id: body.orderId }, relations: ['checks'] });
            if (!order) {
                throw new NotFoundError(`Cannot find order id ${body.orderId}`);
            }

            const existingCheck = await AdminOrderCheck.findOne({
                where: {
                    order: { id: body.orderId },
                    subject: { id: body.itemId },
                    photo_id: body.photoId,
                    product_id: body.cartItemId
                }
            });

            const check = existingCheck
                ? existingCheck
                : new AdminOrderCheck();
            check.order = order;
            check.subject = await TransactionalSubject.findOne({ where: { id: body.itemId } });
            check.photo_id = body.photoId;
            check.product_id = body.cartItemId;
            check.check = body.check;

            await check.save();

            return {
                status: 'great-success'
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            logger.error(
                `Error while setting check for order ${body.orderId}. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'apply-check',
                controller_action: 'applyCheck',
                src_user_id: request.user.id,
                src_user_email: request.user.email,
                order_id: body.orderId,
                stack: error.stack,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error',
                context: 'UNKNOWN_ERROR',
                correlationId: request.correlationId
            };
        }
    }

    @Authorized('update:order')
    @Post('/assign')
    @ResponseSchema(BaseResponse)
    public async assignOrder(@Body() body: AssignOrderRequest,
        @Req() request: Request): Promise<BaseResponse> {
        logger.info(`User ${request.user.email} is assigning order ${body.orderId} to user ${body.userId}`, {
            area: 'http/web',
            subarea: 'controller/order',
            action: 'order:assign',
            controller_action: 'assignOrder',
            src_user_id: request.user.id,
            src_user_email: request.user.email,
            order_id: body.orderId,
            user_id: body.userId,
            ...httpCommonFields(request)
        });

        try {
            await AdminOrderAssignment.assignOrderToUser(body.orderId, body.userId);

            return {
                status: 'great-success'
            };
        } catch (error) {
            logger.error(
                `Error while assigning order ${body.orderId} to user ${body.userId}. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'order:assign',
                controller_action: 'assignOrder',
                src_user_id: request.user.id,
                src_user_email: request.user.email,
                order_id: body.orderId,
                user_id: body.userId,
                stack: error.stack,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error',
                context: 'UNKNOWN_ERROR',
                correlationId: request.correlationId
            };
        }
    }

    @Authorized('delete:order-comment')
    @Post('/comment/delete')
    @ResponseSchema(BaseResponse)
    public async deleteComment(@Body() body: DeleteCommentRequest,
        @Req() request: Request): Promise<BaseResponse> {
        logger.info(`User ${request.user.email} is deleting comment for order ${body.commentId}`, {
            area: 'http/web',
            subarea: 'controller/order',
            action: 'order:delete-comment',
            controller_action: 'deleteComment',
            src_user_id: request.user.id,
            src_user_email: request.user.email,
            comment_id: body.commentId,
            ...httpCommonFields(request)
        });

        try {
            await AdminOrderComment.deleteComment(body.commentId);

            return {
                status: 'great-success'
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            logger.error(
                `Error while deleting comment for order ${body.commentId}. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'order:delete-comment',
                controller_action: 'deleteComment',
                src_user_id: request.user.id,
                src_user_email: request.user.email,
                comment_id: body.commentId,
                stack: error.stack,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error',
                context: 'UNKNOWN_ERROR',
                correlationId: request.correlationId
            };
        }
    }

    @Authorized('update:order-comment', async (action: Action, user: any): Promise<boolean> => {
        const comment = await AdminOrderComment.findOne({
            where: { id: action.request.body.commentId },
            relations: ['user']
        });
        return comment.user.id === user.id;
    })
    @Post('/comment/edit')
    @ResponseSchema(BaseResponse)
    public async editComment(@Body() body: EditCommentRequest,
        @CurrentUser() user: User,
        @Req() request: Request): Promise<BaseResponse> {
        logger.info(`User ${user.email} is editing comment id ${body.commentId}`, {
            area: 'http/web',
            subarea: 'controller/order',
            action: 'order:edit-comment',
            controller_action: 'editComment',
            src_user_id: user.id,
            src_user_email: user.email,
            comment_id: body.commentId,
            ...httpCommonFields(request)
        });

        try {
            await AdminOrderComment.editComment(body.commentId, body.message);

            return {
                status: 'great-success'
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            logger.error(
                `Error while editing comment id ${body.commentId}. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'order:edit-comment',
                controller_action: 'editComment',
                src_user_id: request.user.id,
                src_user_email: request.user.email,
                comment_id: body.commentId,
                stack: error.stack,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error',
                context: 'UNKNOWN_ERROR',
                correlationId: request.correlationId
            };
        }
    }

    @Authorized('update:order')
    @Post('/edit-contact')
    @ResponseSchema(EditContactResponse)
    public async editContact(@Body() body: EditContactRequest,
        @Req() request: Request): Promise<EditContactResponse> {
        logger.info(`User ${request.user.email} is editing contact info for order ${body.id}`, {
            area: 'http/web',
            subarea: 'controller/order',
            action: 'order:edit',
            controller_action: 'editContact',
            src_user_id: request.user.id,
            src_user_email: request.user.email,
            order_id: body.id,
            ...httpCommonFields(request)
        });

        try {
            const order = await TransactionalOrder.findOne({ where: { id: body.id }, relations: ['contact'] });
            let updateContact = false;
            const contact = new TransactionalContact();

            if (!order) {
                throw new NotFoundError(`Cannot find order id ${body.id}`);
            }

            contact.id = order.contact.id;
            contact.first_name = body.firstName ?? order.contact.first_name;
            contact.last_name = body.lastName ?? order.contact.last_name;
            contact.email = body.email ?? order.contact.email;
            contact.phone = body.phone ?? order.contact.phone;
            contact.city = body.city ?? order.contact.city;
            contact.country = body.country ?? order.contact.country;
            contact.region = body.region ?? order.contact.region;
            contact.postal_code = body.postalCode ?? order.contact.postal_code;
            contact.street_address_1 = body.streetAddress1 ?? order.contact.street_address_1;
            contact.street_address_2 = body.streetAddress2 ?? order.contact.street_address_2;
            contact.newsletter = body.newsletter ?? order.contact.newsletter;

            if (await TransactionalOrder.hasMultipleOrdersWithSameContact(order.contact.id)) {
                contact.id = null;
                updateContact = true;
            }

            const savedContact = await contact.save();
            if (updateContact) {
                order.contact = savedContact;
                await order.save();
            }

            return {
                status: 'great-success'
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            logger.error(
                `Error while editing contact info for order ${body.id}. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'order:edit',
                controller_action: 'editContact',
                src_user_id: request.user.id,
                src_user_email: request.user.email,
                order_id: body.id,
                stack: error.stack,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error',
                context: 'UNKNOWN_ERROR',
                correlationId: request.correlationId
            };
        }
    }

    // @Authorized('read:order')
    @Get('/export-contacts')
    public async exportContacts(@QueryParam('lang') lang: Language,
        @QueryParam('ids') ids: string,
        @QueryParam('format') format: SpreadsheetExportFormat,
        @Req() request: Request,
        @Res() response: Response): Promise<void> {
        const parsedIds = ids.split(',').map(i => parseInt(i, 10));

        logger.info(`Exporting contacts for orders`, {
            area: 'http/web',
            subarea: 'controller/order',
            action: 'order:export-contacts',
            controller_action: 'exportContacts',
            language: lang,
            order_ids: parsedIds,
            export_format: format,
            ...httpCommonFields(request)
        });

        if (!Languages.includes(lang)) {
            logger.error(
                `Error while exporting contacts. Reason: Invalid language ${lang}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'order:export-contacts',
                controller_action: 'exportContacts',
                language: lang,
                order_ids: parsedIds,
                export_format: format,
                ...httpCommonFields(request)
            });

            throw new BadRequestError('Invalid language');
        }

        if (!['csv-normal', 'csv-excel'].includes(format)) {
            logger.error(
                `Error while exporting contacts. Reason: Invalid format ${format}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'order:export-contacts',
                controller_action: 'exportContacts',
                export_format: format,
                order_ids: parsedIds,
                ...httpCommonFields(request)
            });

            throw new BadRequestError('Invalid format');
        }

        try {
            const orders = await TransactionalOrder.find({
                where: { id: In(parsedIds) },
                relations: ['contact']
            });

            const t = await getFixedT(lang);
            const csvHeader = `${t('order:contactHeaders.id')},` +
                `${t('order:contactHeaders.firstName')},` +
                `${t('order:contactHeaders.lastName')},` +
                `${t('order:contactHeaders.email')},` +
                `${t('order:contactHeaders.phone')},` +
                `${t('order:contactHeaders.streetAddress1')},` +
                `${t('order:contactHeaders.streetAddress2')},` +
                `${t('order:contactHeaders.city')},` +
                `${t('order:contactHeaders.region')},` +
                `${t('order:contactHeaders.postalCode')},` +
                `${t('order:contactHeaders.country')},` +
                `${t('order:contactHeaders.newsletter')}`;
            const csvData = orders.map(order => {
                const contact = order.contact;
                return `${order.id},` +
                    `${contact.first_name ?? ''},` +
                    `${contact.last_name ?? ''},` +
                    `${contact.email ?? ''},` +
                    `${contact.phone ?? ''},` +
                    `${contact.street_address_1 ?? ''},` +
                    `${contact.street_address_2 ?? ''},` +
                    `${contact.city ?? ''},` +
                    `${contact.region ?? ''},` +
                    `${contact.postal_code ?? ''},` +
                    `${contact.country ?? ''},` +
                    `${contact.newsletter ? t('yes') : t('no')}`;
            }).join('\n');
            const csv = `${csvHeader}\n${csvData}`;

            response.setHeader('Content-Type', 'text/csv; charset=utf-8');
            response.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
            response.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Disposition');
            response.send(format === 'csv-excel'
                ? toExcelUtf8Encoding(csv)
                : csv
            );
        } catch (error) {
            logger.error(
                `Error while exporting contacts. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'order:export-contacts',
                controller_action: 'exportContacts',
                order_ids: parsedIds,
                language: lang,
                export_format: format,
                stack: error.stack,
                error,
                ...httpCommonFields(request)
            });

            request.res.status(500).send('An error occurred while exporting contacts');
        }
    }

    @Authorized('read:order')
    @Get('/get-assigned')
    @ResponseSchema(BaseResponse)
    public async getAssigned(@QueryParam('id') id: string, @Req() request: Request): Promise<GetAssignedResponse> {
        logger.info(`Getting assigned user for order ${id}`, {
            area: 'http/web',
            subarea: 'controller/order',
            action: 'order:get-assigned',
            controller_action: 'getAssigned',
            order_id: id,
            ...httpCommonFields(request)
        });

        try {
            const user = await AdminOrderAssignment.getOrderAssignment(id);

            return {
                status: 'great-success',
                userId: user ? user.id : null
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            logger.error(
                `Error while getting assigned user for order ${id}. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'order:get-assigned',
                controller_action: 'getAssigned',
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error',
                context: 'UNKNOWN_ERROR',
                correlationId: request.correlationId
            };
        }
    }

    @Authorized('read:order')
    @Get('/get-checks')
    @ResponseSchema(GetChecksResponse)
    public async getChecks(@QueryParam('id') id: string, @Req() request: Request): Promise<GetChecksResponse> {
        try {
            return {
                status: 'great-success',
                checks: (await AdminOrderCheck.getChecksForOrder(id)).map(check => ({
                    orderId: id,
                    itemId: check.subject.id,
                    photoId: check.photo_id,
                    check: check.check,
                    cartItemId: check.product_id
                }))
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            logger.error(
                `[OrderController] Error while retrieving checks for order ${id}. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'order:get-checks',
                controller_action: 'getChecks',
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error',
                context: 'UNKNOWN_ERROR',
                correlationId: request.correlationId
            };
        }
    }

    @Authorized('read:order')
    @Get('/comment/get')
    @ResponseSchema(GetCommentsResponse)
    public async getComments(@QueryParams() params: GetCommentsRequest): Promise<GetCommentsResponse> {
        return {
            status: 'great-success',
            comments: (await TransactionalOrder.getOrderComments(params.orderId))
                .map(comment => ({
                    id: comment.id,
                    user: comment.user,
                    message: comment.message,
                    edited: comment.edited,
                    createdOn: comment.created_on,
                    updatedOn: comment.updated_on
                }))
        };
    }

    @Authorized('read:order')
    @Get('/get-status')
    @ResponseSchema(GetOrderStatusResponse)
    public async getOrderStatus(@QueryParam('id') id: string,
        @Req() request: Request): Promise<GetOrderStatusResponse> {
        logger.info(`Getting status for order ${id}`, {
            area: 'http/web',
            subarea: 'controller/order',
            action: 'order:get-status',
            controller_action: 'getOrderStatus',
            order_id: id
        });

        try {
            return {
                status: 'great-success',
                orderStatus: await AdminOrderStatus.get(id)
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            logger.error(
                `[OrderController] Error while retrieving status for order ${id}. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'order:get-status',
                controller_action: 'getOrderStatus',
                order_id: id,
                correlationId: request.correlationId,
                error
            });

            return {
                status: 'error',
                context: 'UNKNOWN_ERROR',
                correlationId: request.correlationId
            };
        }
    }

    @Authorized('read:order')
    @Get('/generate-print-token')
    @ResponseSchema(PrintTokenResponse)
    public async generatePrintToken(@CurrentUser() user: User,
        @QueryParam('id') id: string,
        @Req() request: Request): Promise<PrintTokenResponse> {
        logger.info(`Generating print token for order ${id}`, {
            area: 'http/web',
            subarea: 'controller/order',
            action: 'order:generate-print-token',
            controller_action: 'generatePrintToken',
            order_id: id
        });

        try {
            const parsedIds = id.split(',').map(i => parseInt(i, 10));
            const token = await this.auth.generateResourceToken(user.id, parsedIds.map(id => ({ type: 'order', id })));

            return {
                status: 'great-success',
                token
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            logger.error(
                `[OrderController] Error while generating print token for order ${id}. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'order:generate-print-token',
                controller_action: 'generatePrintToken',
                order_id: id,
                correlationId: request.correlationId,
                error
            });

            return {
                status: 'error',
                context: 'UNKNOWN_ERROR',
                correlationId: request.correlationId
            };
        }
    }

    @Authorized('read:order-publish')
    @Get('/get-published-photos')
    @ResponseSchema(GetOrderPublishPhotosResponse)
    public async getPublishedPhotos(@QueryParam('id') id: string,
        @Req() request: Request): Promise<GetOrderPublishPhotosResponse> {
        logger.info(`User ${request.user.email} is getting published photos for order ${id}`, {
            area: 'http/web',
            subarea: 'controller/order',
            action: 'order:get-published-photos',
            controller_action: 'getPublishedPhotos',
            src_user_id: request.user.id,
            src_user_email: request.user.email,
            order_id: id,
            ...httpCommonFields(request)
        });

        try {
            const photos = await AdminOrderPublishedPhoto.getOrderPublishedPhotos(id);

            return {
                status: 'great-success',
                photos: photos
                    ? photos.map(photo => ({
                        orderId: photo.order.id,
                        itemId: photo.subject.id,
                        originalPath: photo.original_path,
                        versionPath: photo.version_path,
                        published: photo.published
                    }))
                    : []
            };
        } catch (error) {
            logger.error(
                `Error while getting published photos for order ${id}. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'order:get-published-photos',
                controller_action: 'getPublishedPhotos',
                src_user_id: request.user.id,
                src_user_email: request.user.email,
                stack: error.stack,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error',
                context: 'UNKNOWN_ERROR',
                correlationId: request.correlationId
            };
        }
    }

    @Authorized('update:order-publish')
    @Post('/notify-customer')
    @ResponseSchema(NotifyCustomerResponse)
    public async notifyCustomer(@Body() body: OrderNotifyCustomerRequest,
        @Req() request: Request): Promise<NotifyCustomerResponse> {
        logger.info(`User ${request.user.email} is notifying customer about order ${body.orderId}`, {
            area: 'http/web',
            subarea: 'controller/order',
            action: 'order:notify-customer',
            controller_action: 'notifyCustomer',
            src_user_id: request.user.id,
            src_user_email: request.user.email,
            order_id: body.orderId,
            ...httpCommonFields(request)
        });

        try {
            const publishedPhotos = await AdminOrderPublishedPhoto.getOrderPublishedPhotos(body.orderId);
            const downloadToken = await TransactionalOrderPublishedPhoto.getDownloadToken(body.orderId);

            if (publishedPhotos.some(photo => photo.published && !photo.update_sent)) {
                const order = await this.order.getOrders([body.orderId]);

                if (!Array.isArray(order) || order.length === 0) {
                    throw new NotFoundError(`Cannot find order id ${body.orderId}`);
                }

                await this.communication.sendOrderPublishCustomerNotification(order[0], downloadToken);
                await AdminOrderPublishedPhoto.markOrderUpdateSent(body.orderId);

                return {
                    status: 'great-success',
                    updateFound: true
                };
            } else {
                return {
                    status: 'great-success',
                    updateFound: false
                };
            }
        } catch (error) {
            logger.error(
                `Error while notifying customer about order ${body.orderId}. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'order:notify-customer',
                controller_action: 'notifyCustomer',
                src_user_id: request.user.id,
                src_user_email: request.user.email,
                stack: error.stack,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error',
                context: 'UNKNOWN_ERROR',
                correlationId: request.correlationId
            };
        }

        return null;
    }

    @Authorized('update:order-publish')
    @Post('/publish-photos')
    @ResponseSchema(BaseResponse)
    public async publishPhotos(@Body() body: PublishUnpublishOrderPhotosRequest,
        @Req() request: Request): Promise<BaseResponse> {
        logger.info(`User ${request.user.email} is publishing photos`, {
            area: 'http/web',
            subarea: 'controller/order',
            action: 'order:publish-photos',
            controller_action: 'publishPhotos',
            src_user_id: request.user.id,
            src_user_email: request.user.email,
            ...httpCommonFields(request)
        });

        try {
            for (const photo of body.photos) {
                await AdminOrderPublishedPhoto.publishPhoto(
                    photo.orderId, photo.itemId, photo.originalPath, photo.versionPath);
            }

            await this._updateTransactionalPublishedPhotos(body.photos);

            return {
                status: 'great-success'
            };
        } catch (error) {
            logger.error(
                `Error while publishing photos. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'order:publish-photos',
                controller_action: 'publishPhotos',
                src_user_id: request.user.id,
                src_user_email: request.user.email,
                stack: error.stack,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error',
                context: 'UNKNOWN_ERROR',
                correlationId: request.correlationId
            };
        }
    }

    @Authorized('read:order')
    @Post('/read')
    @ResponseSchema(DataTableBaseResponse)
    public async read(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalOrder, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('read:order')
    @Get('/get')
    @ResponseSchema(ReadOrderResponse)
    public async readOrder(@QueryParam('id') id: string, @Req() request: Request): Promise<ReadOrderResponse> {
        try {
            const parsedIds = id.split(',');
            const orderDescriptors = await this.order.getOrders(parsedIds, true);

            return {
                status: 'great-success',
                orders: orderDescriptors
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            logger.error(
                `[OrderController] Error while retrieving orders ${id}. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'order:get',
                controller_action: 'readOrder',
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error',
                context: 'UNKNOWN_ERROR',
                correlationId: request.correlationId
            };
        }
    }

    @Authorized('update:order-publish')
    @Post('/unpublish-photos')
    @ResponseSchema(BaseResponse)
    public async unpublishPhotos(@Body() body: PublishUnpublishOrderPhotosRequest,
        @Req() request: Request): Promise<BaseResponse> {
        logger.info(`User ${request.user.email} is unpublishing photos`, {
            area: 'http/web',
            subarea: 'controller/order',
            action: 'order:unpublish-photos',
            controller_action: 'unpublishPhotos',
            src_user_id: request.user.id,
            src_user_email: request.user.email,
            ...httpCommonFields(request)
        });

        try {
            for (const photo of body.photos) {
                await AdminOrderPublishedPhoto.unpublishPhoto(
                    photo.orderId, photo.itemId, photo.originalPath, photo.versionPath);
            }

            await this._updateTransactionalPublishedPhotos(body.photos);

            return {
                status: 'great-success'
            };
        } catch (error) {
            logger.error(
                `Error while unpublishing photos. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/order',
                action: 'order:unpublish-photos',
                controller_action: 'unpublishPhotos',
                src_user_id: request.user.id,
                src_user_email: request.user.email,
                stack: error.stack,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error',
                context: 'UNKNOWN_ERROR',
                correlationId: request.correlationId
            };
        }
    }

    @Authorized('update:order')
    @Post('/set-status')
    @ResponseSchema(BaseResponse)
    public async setOrderStatus(@Body() body: SetOrderStatusRequest): Promise<BaseResponse> {
        logger.info(`Setting status for order`, {
            area: 'http/web',
            subarea: 'controller/order',
            action: 'order:set-status',
            controller_action: 'setOrderStatus',
            order_id: body.id,
            order_status: body.status
        });

        try {
            await AdminOrderStatus.set(body.id, body.status);

            return {
                status: 'great-success'
            };
        } catch {
            return {
                status: 'error',
                context: 'UNKNOWN_ERROR'
            };
        }
    }

    /* PRIVATE */
    private async _updateTransactionalPublishedPhotos(photos: PhotoPublish[]): Promise<void> {
        for (const orderId of photos.reduce(
            (ids, photo) => { if (!ids.includes(photo.orderId)) ids.push(photo.orderId); return ids; }, [])) {
            await TransactionalOrderPublishedPhoto.updateOrderPublishedPhotos(orderId);
        }
    }
}
