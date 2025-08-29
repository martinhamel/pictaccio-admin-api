import { EmailAddress, TaxLocality } from '../../../../http/shared/controllers/requests/set_store_config_request';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class GetStoreConfigResponse extends BaseResponse {
    public config: {
        storeName?: string;
        storeAccentColor?: string;
        storeLogo?: string;
        address?: {
            addressLine1?: string,
            addressLine2?: string,
            unitType?: string,
            unitNumber?: string,
            city?: string,
            province?: string,
            country?: string,
            postalCode?: string
        };
        emailAddresses?: EmailAddress[];
        phones?: { name: { [key: string]: string }, phone: string }[];
        taxLocality?: TaxLocality;
        taxRateHst?: string;
        taxRateGst?: string;
        taxRateQst?: string;
        taxRatePst?: string;
        taxIdHst?: string;
        taxIdGst?: string;
        taxIdQst?: string;
        taxIdPst?: string;
    };


    constructor() {
        super();

        this.config = {};
        this.config.address = {};
    }
}
