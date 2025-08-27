import { Service } from 'typedi';
import { Authorized, Body, Get, JsonController, Post, QueryParams } from '@loufa/routing-controllers';
import { ResponseSchema } from '@loufa/routing-controllers-openapi';
import { TransactionalSubject } from '@pictaccio/admin-api/database/entities/transactional_subject';
import { EditSubjectRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/edit_subject_request';
import { EditAccountResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/edit_subject_response';
import { SubjectExistResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/subject_exist_response';
import { SubjectExistRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/subject_exist_request';
import { SubjectSwapPhotosRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/subject_swap_photos_request';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

@Service()
@JsonController('/subject')
export class SubjectController {
    @Authorized('update:session')
    @Post('/edit')
    @ResponseSchema(EditAccountResponse)
    public async editSubject(@Body() body: EditSubjectRequest): Promise<EditAccountResponse> {
        const subject = await TransactionalSubject.findOne({ where: { id: body.subjectId } });
        let nameChanged = false;

        for (const info of body.subjectInfo) {
            subject.info[subject.mappings[info.prop]] = info.value;

            if (['first-name', 'last-name'].includes(subject.mappings[info.prop])) {
                nameChanged = true;
            }
        }

        if (nameChanged) {
            subject.display_name =
                subject.info[subject.mappings['first-name']] + ' ' + subject.info[subject.mappings['last-name']];
        }

        await subject.save();

        return {
            status: 'great-success'
        };
    }

    @Authorized('read:session')
    @Get('/exist')
    @ResponseSchema(SubjectExistResponse)
    public async subjectExist(@QueryParams() params: SubjectExistRequest): Promise<SubjectExistResponse> {
        const codeExist = await TransactionalSubject.codesExist(params.codes);

        return {
            status: 'great-success',
            codeExist
        };
    }

    /**
     * Swap photos between two subjects. It identifies the source subject with its subject ID and a path to one of its
     * photos and the target subject with its subject ID. The photo reference is remove from the source subject and
     * added to the target subject.
     */
    @Authorized('update:session')
    @Post('/swap-photos')
    @ResponseSchema(BaseResponse)
    public async swapPhotos(@Body() body: SubjectSwapPhotosRequest): Promise<BaseResponse> {
        const subjects1 = await TransactionalSubject.getSubjects(body.subjectId1);
        const subjects2 = await TransactionalSubject.getSubjects(body.subjectId2);

        subjects2.push(subjects1.splice(subjects1.findIndex(p => p === body.photoPath), 1)[0]);

        await TransactionalSubject.replaceSubjects(body.subjectId1, subjects1);
        await TransactionalSubject.replaceSubjects(body.subjectId2, subjects2);

        return {
            status: 'great-success'
        };
    }
}
