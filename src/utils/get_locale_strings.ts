import { TFunction } from 'i18next';
import { getFixedT } from '@pictaccio/admin-api/loaders/i18next';
import { Languages } from '@pictaccio/admin-api/types/language';
import { LocalizedString } from '@pictaccio/admin-api/types/localized_string';
import { zipOpject } from '@pictaccio/admin-api/utils/zip_object';

let tFunctions: TFunction[];

(async function () {
    tFunctions = await Promise.all(Object.values(Languages).map(l => getFixedT(l)));
}());

export function getLocaleStrings(path: string): LocalizedString {
    return zipOpject(Object.values(Languages), tFunctions.map(t => t(path))) as LocalizedString;
}
