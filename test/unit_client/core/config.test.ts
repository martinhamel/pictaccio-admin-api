import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import sinon, { createSandbox, SinonSandbox } from 'sinon'
import { Container } from 'typedi';

const MockConfig = {
    auth: {
        secret: 'test'
    }
};
Container.set('config', MockConfig);

describe('Client/Core/Config', () => {
    // Pass
});