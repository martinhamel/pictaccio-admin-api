import { SLOT_T } from '@pictaccio/admin-api/http/web/views/view';

export default function t(key: string, options): string {
    const t = options.data.root.__internals__[SLOT_T];

    return t(key, options.hash);
}
