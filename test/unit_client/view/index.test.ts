import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { JSDOM } from 'jsdom';
import sinon, { createSandbox, SinonSandbox } from 'sinon'
import { Container } from 'typedi';
import { attachViewmodels } from '../../../src_client/scripts/lib/viewmodel';


describe('Client/Viewmodel/Index', () => {
    it('Should walk down the DOM and create the viewmodel it finds and attach the proper object', () => {
        const dom = JSDOM(
`<!DOCTYPE html>
<head><title>test</title></head>
<body>
    <div>
        <view type="page">
            <div>
                <view type="table">
                    <p>
                        Paragraph
                    </p>
                </view>
            </div>
        </view>
    </div>
</body>`
        );

        attachViewmodels();
    });
});