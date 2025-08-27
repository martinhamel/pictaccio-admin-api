export enum TaxLocality {
    Quebec = 'ca-qc',
    Ontario = 'ca-on',
    NewfoundlandAndLabrador = 'ca-nl',
    PrinceEdwardIsland = 'ca-pe',
    NovaScotia = 'ca-ns',
    NewBrunswick = 'ca-nb',
    Manitoba = 'ca-mb',
    Saskatchewan = 'ca-sk',
    Alberta = 'ca-ab',
    BritishColumbia = 'ca-bc',
    Yukon = 'ca-yt',
    NorthwestTerritories = 'ca-nt',
    Nunavut = 'ca-nu',
}

export class EmailAddress {
    public name: string;
    public email: string;
}

export class SetStoreConfigRequest {
    public storeName?: string;
    public storeAccentColor?: string;
    public storeLogo?: string;
    public address?: {
        addressLine1: string,
        addressLine2: string,
        unitType?: string,
        unitNumber?: string,
        city: string,
        province: string,
        country: string,
        postalCode: string
    };
    public emailAddresses?: EmailAddress[];
    public phones?: {name: {[key: string]: string}, phone: string}[];
    public taxLocality?: TaxLocality;
    public taxRateHst?: string;
    public taxRateGst?: string;
    public taxRateQst?: string;
    public taxRatePst?: string;
    public taxIdHst?: string;
    public taxIdGst?: string;
    public taxIdQst?: string;
    public taxIdPst?: string;
}
