import { checkFileMimeType, getUniqueFilename } from '@loufa/loufairy-server/src/entry';
import { Authorized, BadRequestError, Body, CurrentUser, JsonController, Post, Req } from '@loufa/routing-controllers';
import { ResponseSchema } from '@loufa/routing-controllers-openapi';
import { ConfigSchema } from '../../../core/config_schema';
import { logger } from '../../../core/logger';
import { httpCommonFields } from '../../../core/logger_common';
import { TransactionalSession } from '../../../database/entities/transactional_session';
import { TransactionalSubject } from '../../../database/entities/transactional_subject';
import { TransactionalSubjectGroup } from '../../../database/entities/transactional_subject_group';
import { TransactionalWorkflow } from '../../../database/entities/transactional_workflow';
import {
    DataTable,
    fromCreateRequest,
    fromDeleteRequest,
    fromReadRequest,
    fromUpdateRequest
} from '../../../database/helpers/data_table';
import { ExistError } from '../../../errors/exist_error';
import { CreateSessionRequest } from '../../../http/shared/controllers/requests/create_session_request';
import {
    DataTableCreateBaseRequest
} from '../../../http/shared/controllers/requests/data_table_create_base_request';
import {
    DataTableDeleteBaseRequest
} from '../../../http/shared/controllers/requests/data_table_delete_base_request';
import {
    DataTableReadBaseRequest
} from '../../../http/shared/controllers/requests/data_table_read_base_request';
import {
    DataTableUpdateBaseRequest
} from '../../../http/shared/controllers/requests/data_table_update_base_request';
import { GroupUploadRequest } from '../../../http/shared/controllers/requests/group_upload_request';
import {
    PhotoSessionAddVersionRequest
} from '../../../http/shared/controllers/requests/photo_session_add_version_request';
import {
    PhotoSessionArchiveRequest
} from '../../../http/shared/controllers/requests/photo_session_archive_request';
import {
    PhotoSessionRemoveVersionRequest
} from '../../../http/shared/controllers/requests/photo_session_remove_version_request';
import { SubjectUploadRequest } from '../../../http/shared/controllers/requests/subject_upload_request';
import { BaseResponse } from '../../../http/shared/controllers/responses/base_response';
import { CreateSessionResponse } from '../../../http/shared/controllers/responses/create_session_response';
import { DataTableBaseResponse } from '../../../http/shared/controllers/responses/data_table_base_response';
import { GroupUploadResponse } from '../../../http/shared/controllers/responses/group_upload_response';
import {
    PhotoSessionArchiveResponse
} from '../../../http/shared/controllers/responses/photo_session_archive_response';
import { SubjectUploadResponse } from '../../../http/shared/controllers/responses/subject_upload_response';
import ImageService from '../../../services/image_service';
import { File } from '../../../types/file';
import { Request } from '../../../types/request';
import { SubjectInfo } from '../../../types/subject_info';
import { User } from '@pictaccio/shared/types/user';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { Inject, Service } from 'typedi';

@Service()
@JsonController('/photo-session')
export class PhotoSessionController {
    constructor(@Inject('config') private _config: ConfigSchema,
        @Inject('image') private _imageService: ImageService) {
    }

    @Authorized('delete:session')
    @Post('/archive')
    @ResponseSchema(PhotoSessionArchiveResponse)
    public async archive(@Body() body: PhotoSessionArchiveRequest): Promise<PhotoSessionArchiveResponse> {
        try {
            await TransactionalSession.archive(body.sessionId);

            return {
                status: 'great-success'
            };
        } catch (error) {
            return {
                status: 'error'
            };
        }
    }

    @Authorized('create:session')
    @Post('/category/create')
    @ResponseSchema(DataTableBaseResponse)
    public async categoryCreate(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalWorkflow, request);

        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized('delete:session')
    @Post('/category/delete')
    @ResponseSchema(DataTableBaseResponse)
    public async categoryDelete(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalWorkflow, request);

        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('read:session')
    @Post('/category/read')
    @ResponseSchema(DataTableBaseResponse)
    public async categoryRead(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalWorkflow, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('update:session')
    @Post('/category/update')
    @ResponseSchema(DataTableBaseResponse)
    public async categoryUpdate(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalWorkflow, request);

        return await dataTable.processUpdate(fromUpdateRequest(body));
    }

    @Authorized('create:session')
    @Post('/create')
    @ResponseSchema(DataTableBaseResponse)
    public async create(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalSession, request);

        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized()
    @Post('/create-session')
    @ResponseSchema(CreateSessionResponse)
    public async createSession(@CurrentUser() user: User,
        @Req() request: Request,
        @Body() body: CreateSessionRequest): Promise<CreateSessionResponse> {
        logger.info(
            `[PhotoSessionController] User ${user.email} is creating a new session.`, {
            area: 'http/web',
            subarea: 'controller/photo-session',
            action: 'session:create',
            controller_action: 'createSession',
            email: user.email,
            sourceId: user.id,
            ...httpCommonFields(request)
        });

        try {
            if (this._config.featureFlags.subjectCodeDupeValidation) {
                const codesExist = await TransactionalSubject.codesExist(body.subjects.map(subject => subject.code));
                if (Object.values(codesExist).some(exist => exist)) {
                    throw new ExistError('Create session request contains subject codes that are already in use');
                }
            }

            const sessionId = await TransactionalSession.createSession(body);
            const transformedSubjects: SubjectInfo[] = [];

            for (const subject of body.subjects) {
                transformedSubjects.push({
                    firstName: subject.firstName,
                    lastName: subject.lastName,
                    subjectCode: subject.code,
                    uniqueCode: subject.uid ?? '',
                    group: subject.group ?? '',
                    extra: subject
                });
            }

            await TransactionalSubject.createSubject(sessionId, transformedSubjects, body.mappings);

            return {
                status: 'great-success',
                sessionId
            };
        } catch (error) {
            logger.error(
                `[PhotoSessionController] Failed to create a new session`, {
                area: 'http/web',
                subarea: 'controller/photo-session',
                action: 'session:create',
                controller_action: 'createSession',
                body,
                email: user.email,
                sourceId: user.id,
                ...httpCommonFields(request),
                error
            });

            return {
                status: 'error'
            };
        }
    }

    @Authorized('delete:session')
    @Post('/delete')
    @ResponseSchema(DataTableBaseResponse)
    public async delete(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalSession, request);

        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('create:session-versions')
    @Post('/group/add-version')
    @ResponseSchema(BaseResponse)
    public async groupAddVersion(@Body() body: PhotoSessionAddVersionRequest,
        @Req() request: Request,
        @CurrentUser() user: User): Promise<BaseResponse> {
        let imagePath = '';

        logger.info('Adding version to session photo', {
            area: 'http/web',
            subarea: 'controller/photo-session',
            action: 'add-version',
            controller_action: 'addVersion',
            subjectId: body.itemId,
            original: body.original
        });

        try {
            const imageMimeType = process.platform === 'win32'
                ? 'image/png'
                : await checkFileMimeType(request.files['versionImage']['data']);

            if (!['image/png', 'image/jpeg'].includes(imageMimeType)) {
                logger.error(`User ${user.email} tried to upload a version of a photo but the file is invalid`, {
                    detected_mime_type: imageMimeType,
                    src_email: user.email,
                    ...httpCommonFields(request)
                });

                return {
                    status: 'failed',
                    context: 'INVALID_FORMAT'
                };
            }

            imagePath = await this._persistFile(request.files['versionImage'], 'subject');

            await TransactionalSubjectGroup.addVersion(body.itemId, body.original, imagePath);

            return {
                status: 'great-success'
            };
        } catch (error) {
            logger.error('Failed to add version to session photo', {
                area: 'http/web',
                subarea: 'controller/photo-session',
                action: 'add-version',
                controller_action: 'addVersion',
                subjectId: body.itemId,
                original: body.original,
                error
            });

            if (imagePath !== '') {
                await unlink(join(this._config.env.dirs.public, imagePath));
            }

            return {
                status: 'error'
            };
        }
    }

    @Authorized('create:session')
    @Post('/group/create')
    @ResponseSchema(DataTableBaseResponse)
    public async groupCreate(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalSubjectGroup, request);

        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized('delete:session')
    @Post('/group/delete')
    @ResponseSchema(DataTableBaseResponse)
    public async groupDelete(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalSubjectGroup, request);

        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('read:session')
    @Post('/group/read')
    @ResponseSchema(DataTableBaseResponse)
    public async groupRead(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalSubjectGroup, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('delete:session-versions')
    @Post('/group/remove-version')
    @ResponseSchema(BaseResponse)
    public async groupRemoveVersion(@Body() body: PhotoSessionRemoveVersionRequest): Promise<BaseResponse> {
        logger.info('Deleting version from session subject', {
            area: 'http/web',
            subarea: 'controller/photo-session',
            action: 'remove-version',
            controller_action: 'removeVersion',
            subjectId: body.itemId,
            original: body.original,
            version: body.version
        });

        try {
            await TransactionalSubjectGroup.removeVersion(body.itemId, body.original, body.version);
            await unlink(join(this._config.env.dirs.public, body.version));

            return {
                status: 'great-success'
            };
        } catch (error) {
            return {
                status: 'error'
            };
        }
    }

    @Authorized('update:session')
    @Post('/group/update')
    @ResponseSchema(DataTableBaseResponse)
    public async groupUpdate(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalSubjectGroup, request);

        return await dataTable.processUpdate(fromUpdateRequest(body));
    }

    @Authorized('update:session')
    @Post('/group/upload')
    @ResponseSchema(GroupUploadResponse)
    public async groupUpload(@CurrentUser() user: User,
        @Req() request: Request,
        @Body() body: GroupUploadRequest): Promise<GroupUploadResponse> {
        logger.info(
            `[PhotoSessionController] User ${user.email} is uploading a group.`, {
            area: 'http/web',
            subarea: 'controller/photo-session',
            action: 'group:upload',
            controller_action: 'groupUpload',
            email: user.email,
            sourceId: user.id,
            ...httpCommonFields(request)
        });

        try {
            const files: string[] = [];

            logger.info(`Verifying file types`, {
                area: 'http/web',
                subarea: 'controller/photo-session',
                action: 'group:upload',
                controller_action: 'groupUpload',
                email: user.email,
                sourceId: user.id,
                ...httpCommonFields(request)
            });

            for (const file of Object.values(request.files)) {
                const imageMimeType = process.platform === 'win32'
                    ? 'image/png'
                    : await checkFileMimeType(file['data']);

                if (!['image/png', 'image/jpeg'].includes(imageMimeType)) {
                    logger.error('Invalid file type for group photo', {
                        area: 'http/web',
                        subarea: 'controller/photo-session',
                        action: 'subject:upload',
                        controller_action: 'subjectUpload',
                        email: user.email,
                        sourceId: user.id,
                        ...httpCommonFields(request)
                    });
                    throw new BadRequestError('Invalid file type for group photo');
                }

                files.push(await this._persistFile(file, 'group'));
            }

            logger.info(`Resizing thumbnails for group ${body.data.name}`, {
                area: 'http/web',
                subarea: 'controller/photo-session',
                action: 'group:upload',
                controller_action: 'groupUpload',
                email: user.email,
                sourceId: user.id,
                ...httpCommonFields(request)
            });

            await this._imageService.resizeForThumbnails(files);

            logger.info(`Resizing thumbnails with watermark for group ${body.data.name}`, {
                area: 'http/web',
                subarea: 'controller/photo-session',
                action: 'group:upload',
                controller_action: 'groupUpload',
                email: user.email,
                sourceId: user.id,
                ...httpCommonFields(request)
            });

            await this._imageService.resizeForWatermarkedThumbnails(files);

            logger.info(`Creating group ${body.data.name}`, {
                area: 'http/web',
                subarea: 'controller/photo-session',
                action: 'group:upload',
                controller_action: 'groupUpload',
                email: user.email,
                sourceId: user.id,
                ...httpCommonFields(request)
            });

            await TransactionalSubjectGroup.createGroup(body.sessionId, body.data.name, files);

            logger.info(`Group uploaded successfully`, {
                area: 'http/web',
                subarea: 'controller/photo-session',
                action: 'group:upload',
                controller_action: 'groupUpload',
                email: user.email,
                sourceId: user.id,
                ...httpCommonFields(request)
            });

            return {
                status: 'great-success'
            };
        } catch (error) {
            logger.error(
                `[PhotoSessionController] Failed to upload group`, {
                area: 'http/web',
                subarea: 'controller/photo-session',
                action: 'group:upload',
                controller_action: 'groupUpload',
                body,
                email: user.email,
                sourceId: user.id,
                ...httpCommonFields(request),
                error
            });

            return {
                status: 'error'
            };
        }
    }

    @Authorized('read:session')
    @Post('/read')
    @ResponseSchema(DataTableBaseResponse)
    public async read(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalSession, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('create:session-versions')
    @Post('/subject/add-version')
    @ResponseSchema(BaseResponse)
    public async subjectAddVersion(@Body() body: PhotoSessionAddVersionRequest,
        @Req() request: Request,
        @CurrentUser() user: User): Promise<BaseResponse> {
        let imagePath = '';

        logger.info('Adding version to session photo', {
            area: 'http/web',
            subarea: 'controller/photo-session',
            action: 'add-version',
            controller_action: 'addVersion',
            subjectId: body.itemId,
            original: body.original
        });

        try {
            const imageMimeType = process.platform === 'win32'
                ? 'image/png'
                : await checkFileMimeType(request.files['versionImage']['data']);

            if (!['image/png', 'image/jpeg'].includes(imageMimeType)) {
                logger.error(`User ${user.email} tried to upload a version of a photo but the file is invalid`, {
                    detected_mime_type: imageMimeType,
                    src_email: user.email,
                    ...httpCommonFields(request)
                });

                return {
                    status: 'failed',
                    context: 'INVALID_FORMAT'
                };
            }

            imagePath = await this._persistFile(request.files['versionImage'], 'subject');

            await TransactionalSubject.addVersion(body.itemId, body.original, imagePath);

            return {
                status: 'great-success'
            };
        } catch (error) {
            logger.error('Failed to add version to session photo', {
                area: 'http/web',
                subarea: 'controller/photo-session',
                action: 'add-version',
                controller_action: 'addVersion',
                subjectId: body.itemId,
                original: body.original,
                error
            });

            if (imagePath !== '') {
                await unlink(join(this._config.env.dirs.public, imagePath));
            }

            return {
                status: 'error'
            };
        }
    }

    @Authorized('create:session')
    @Post('/subject/create')
    @ResponseSchema(DataTableBaseResponse)
    public async subjectCreate(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalSubject, request);

        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized('delete:session')
    @Post('/subject/delete')
    @ResponseSchema(DataTableBaseResponse)
    public async subjectDelete(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalSubject, request);

        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('read:session')
    @Post('/subject/read')
    @ResponseSchema(DataTableBaseResponse)
    public async subjectRead(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalSubject, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('delete:session-versions')
    @Post('/subject/remove-version')
    @ResponseSchema(BaseResponse)
    public async subjectRemoveVersion(@Body() body: PhotoSessionRemoveVersionRequest): Promise<BaseResponse> {
        logger.info('Deleting version from session subject', {
            area: 'http/web',
            subarea: 'controller/photo-session',
            action: 'remove-version',
            controller_action: 'removeVersion',
            subjectId: body.itemId,
            original: body.original,
            version: body.version
        });

        try {
            await TransactionalSubject.removeVersion(body.itemId, body.original, body.version);
            await unlink(join(this._config.env.dirs.public, body.version));

            return {
                status: 'great-success'
            };
        } catch (error) {
            return {
                status: 'error'
            };
        }
    }

    @Authorized('update:session')
    @Post('/subject/update')
    @ResponseSchema(DataTableBaseResponse)
    public async subjectUpdate(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalSubject, request);

        return await dataTable.processUpdate(fromUpdateRequest(body));
    }

    @Authorized('update:session')
    @Post('/subject/upload')
    @ResponseSchema(SubjectUploadResponse)
    public async subjectUpload(@CurrentUser() user: User,
        @Req() request: Request,
        @Body() body: SubjectUploadRequest): Promise<SubjectUploadResponse> {
        logger.info(
            `User ${user.email} is uploading a subject.`, {
            area: 'http/web',
            subarea: 'controller/photo-session',
            action: 'subject:upload',
            controller_action: 'subjectUpload',
            email: user.email,
            sourceId: user.id,
            ...httpCommonFields(request)
        });

        try {
            const files: string[] = [];

            logger.debug('Verifying images and saving them to disk', {
                area: 'http/web',
                subarea: 'controller/photo-session',
                action: 'subject:upload',
                controller_action: 'subjectUpload',
                email: user.email,
                sourceId: user.id,
                ...httpCommonFields(request)
            });

            for (const file of Object.values(request.files)) {
                const imageMimeType = process.platform === 'win32'
                    ? 'image/png'
                    : await checkFileMimeType(file['data']);

                if (!['image/png', 'image/jpeg'].includes(imageMimeType)) {
                    logger.error('Invalid file type for subject', {
                        area: 'http/web',
                        subarea: 'controller/photo-session',
                        action: 'subject:upload',
                        controller_action: 'subjectUpload',
                        email: user.email,
                        sourceId: user.id,
                        ...httpCommonFields(request)
                    });
                    throw new BadRequestError('Invalid file type for subject');
                }

                files.push(await this._persistFile(file, 'subject'));
            }

            logger.debug('Commit subjects to database', {
                area: 'http/web',
                subarea: 'controller/photo-session',
                action: 'subject:upload',
                controller_action: 'subjectUpload',
                email: user.email,
                sourceId: user.id,
                files,
                ...httpCommonFields(request)
            });

            await TransactionalSubject.replaceSubjectsFromSessionAndCode(body.sessionId, body.data.code, files);

            logger.info('Resize subjects for thumbnails', {
                area: 'http/web',
                subarea: 'controller/photo-session',
                action: 'subject:upload',
                controller_action: 'subjectUpload',
                email: user.email,
                sourceId: user.id,
                files,
                ...httpCommonFields(request)
            });

            await this._imageService.resizeForThumbnails(files);
            await this._imageService.resizeForWatermarkedThumbnails(files);

            logger.info(`Resize and subject uploaded successfully`, {
                area: 'http/web',
                subarea: 'controller/photo-session',
                action: 'subject:upload',
                controller_action: 'subjectUpload',
                email: user.email,
                sourceId: user.id,
                ...httpCommonFields(request)
            });

            return {
                status: 'great-success'
            };
        } catch (error) {
            logger.error(
                `Failed to upload subject`, {
                area: 'http/web',
                subarea: 'controller/photo-session',
                action: 'subject:upload',
                controller_action: 'subjectUpload',
                body,
                email: user.email,
                sourceId: user.id,
                ...httpCommonFields(request),
                error
            });

            return {
                status: 'error'
            };
        }
    }

    @Authorized('update:session')
    @Post('/update')
    @ResponseSchema(DataTableBaseResponse)
    public async update(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalSession, request);

        return await dataTable.processUpdate(fromUpdateRequest(body));
    }

    /* PRIVATE */
    private async _persistFile(file: File, imageType: 'subject' | 'group'): Promise<string> {
        const path = await getUniqueFilename(join(this._config.app.dirs.sessionPhotos, `${imageType}-.jpeg`));
        await file.mv(path);

        return path.substring(this._config.env.dirs.public.length + 1);
    }
}
