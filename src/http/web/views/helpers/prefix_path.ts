import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';
import { join } from 'path';
import { Container } from 'typedi';

type PathKind =
    'img' |
    'script' |
    'css';

const config = Container.get<ConfigSchema>('config');
const prefixes = {
    css: config.http.servers.web.dirs.public.css,
    img: config.http.servers.web.dirs.public.img,
    script: config.http.servers.web.dirs.public.script
};

export default function prefixPath(kind: PathKind, path: string): string {
    return join(prefixes[kind], path);
}
