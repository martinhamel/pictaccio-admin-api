import { SafeString } from 'handlebars';
import { marked } from 'marked';

export default function mdToHtml(md: string): SafeString {
    return new SafeString(marked(md, {async: false}) as string);
}
