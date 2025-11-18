import { ChannelCredentials, Metadata } from '@grpc/grpc-js';
import { wrapGrpcClient, WrappedGrpcClient } from '@loufa/loufairy-server';
import { ConfigSchema } from '../core/config_schema';
import { logger } from '../core/logger';
import JobsService from '../services/jobs_service';
import { ImageClient } from '@pictaccio/grpc-service-contracts/image_service_v1_grpc_pb';
import {
    ImageResizeItem,
    ResizeRequest,
    SizeProfile,
    WatermarkedResizeRequest
} from '@pictaccio/grpc-service-contracts/image_service_v1_pb';
import { computeThumbnailOutputFileName } from '@pictaccio/shared/utils/compute_thumbnail_output_filename';
import { access } from 'node:fs/promises';
import { Inject, Service } from 'typedi';

@Service('image')
export default class ImageService {
    private _grpc: WrappedGrpcClient<ImageClient>;

    constructor(@Inject('config') private config: ConfigSchema,
        @Inject() private jobsService: JobsService) {
        // @ts-ignore
        this._grpc = wrapGrpcClient(ImageClient,
            `${config.rpc.clients.imageService.host}:${config.rpc.clients.imageService.port}`,
            ChannelCredentials.createInsecure()
        );
    }

    public async getThumbnails(files: string[]): Promise<string[]> {
        const thumbnails =
            files.map(file => [file, computeThumbnailOutputFileName(this.config.app.dirs.thumbnails, file, 'medium')]);
        const missingThumbnails: string[] = [];

        for (const [original, thumbnail] of thumbnails) {
            try {
                await access(thumbnail);
            } catch {
                missingThumbnails.push(original);
            }
        }

        if (missingThumbnails.length) {
            await this.resizeForThumbnails(missingThumbnails);
        }

        return thumbnails.map(thumb => thumb[1].substring(this.config.env.dirs.public.length + 1));
    }

    public async getWatermarkedThumbnails(files: string[]): Promise<string[]> {
        const thumbnails =
            files.map(file => [
                file,
                computeThumbnailOutputFileName(this.config.app.dirs.thumbnails, file, 'medium-watermarked')]);
        const missingThumbnails: string[] = [];

        for (const [original, thumbnail] of thumbnails) {
            try {
                await access(thumbnail);
            } catch {
                missingThumbnails.push(original);
            }
        }

        if (missingThumbnails.length) {
            await this.resizeForWatermarkedThumbnails(missingThumbnails);
        }

        return thumbnails.map(thumb => thumb[1].substring(this.config.env.dirs.public.length + 1));
    }

    public async resizeForWatermarkedThumbnails(files: string[]): Promise<void> {
        const request = new WatermarkedResizeRequest();
        const timeoutMilliseconds = 5000;
        const metadata = new Metadata();

        metadata.set('grpc-timeout', `${timeoutMilliseconds}m`);
        request.setItemsList(files.map(file => {
            const item = new ImageResizeItem();

            item.setFile(file);
            item.setProfile(SizeProfile.NORMAL);
            return item;
        }));
        request.setWatermarkimagepath(this.config.app.files.watermarkImage);

        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                await this._grpc.createWatermarkedThumbnails(request, metadata);
                break;
            } catch (error) {
                logger.error('Error resizing images for watermarked thumbnails', {
                    area: 'services',
                    subarea: 'image-service',
                    action: 'makeWatermarkedThumbnails',
                    error
                });
            }
        }
    }

    public async resizeForThumbnails(files: string[]): Promise<void> {
        const request = new ResizeRequest();
        const timeoutMilliseconds = 5000;
        const metadata = new Metadata();

        metadata.set('grpc-timeout', `${timeoutMilliseconds}m`);
        request.setItemsList(files.map(file => {
            const item = new ImageResizeItem();

            item.setFile(file);
            item.setProfile(SizeProfile.NORMAL);
            return item;
        }));

        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                await this._grpc.createThumbnails(request, metadata);
                break;
            } catch (error) {
                logger.error('Error resizing images for thumbnails', {
                    area: 'services',
                    subarea: 'image-service',
                    action: 'resizeForThumbnail',
                    error
                });
            }
        }
    }

    /* PRIVATE */
}
