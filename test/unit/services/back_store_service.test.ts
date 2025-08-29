import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect, use } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai'
import { Container } from 'typedi';
import { BackStoreService } from '../../../src/services/back_store_service';
import { FastStoreInterface } from '../../../src/core/fast_store_interface';

// Not sure why it doesn't work without this line
require('../../../src/services/back_store_service');

use(sinonChai);

const MockConfig = {
    env: {
        environment: 'test'
    },
    server: {
        sessionTTL: 10
    }
}

class MockRedisService {
    public async ready(): Promise<void> {
        return Promise.resolve();
    }

    public async del(): Promise<void> {
        return Promise.resolve();
    }

    public async expire(): Promise<void> {
        return Promise.resolve();
    }

    public async get(key: string): Promise<string> {
        if (key === 'pictaccio-backstore-key1') {
            return JSON.stringify({ session: 1 });
        } else if (key === 'pictaccio-backstore-key2') {
            return JSON.stringify({ session: 2 });
        }

        return '{}';
    }

    public async mget(keys: string[]): Promise<string[]> {
        if (keys.includes('pictaccio-backstore-key1') && keys.includes('pictaccio-backstore-key2')) {
            return [
                JSON.stringify({ session: 1 }),
                JSON.stringify({ session: 2 })
            ];
        }

        return [];
    }

    public async scan(): Promise<string[]> {
        return Promise.resolve(['pictaccio-backstore-key1', 'pictaccio-backstore-key2']);
    }

    public async set(): Promise<void> {
        return Promise.resolve();
    }
}

describe('Services/BackStoreService', () => {
    let backStore: BackStoreService;
    let mockRedisService: MockRedisService;
    let stub;

    beforeEach(() => {
        Container.set('config', MockConfig);
        Container.set('fast-store', mockRedisService = new MockRedisService());
        backStore = Container.get('backstore');
    });

    afterEach(() => {
        stub.restore();
    });

    it('should call ready on its redis dependency when init is called', async () => {
        const redis = Container.get('fast-store') as FastStoreInterface;
        stub = sinon.stub(redis, 'ready').returns(Promise.resolve());

        await backStore.init();

        expect(redis.ready).to.have.been.calledWith();
    });

    it('should call set on its redis dependency when set is called', (done) => {
        // @ts-ignore
        stub = sinon.stub(backStore.fastStore, 'set').returns(Promise.resolve());

        backStore.set('test-session-id', { test: 'session' }, (error) => {
            // @ts-ignore
            expect(backStore.fastStore.set).to.have.been.calledWith(
                'pictaccio-backstore-test-session-id',
                sinon.match.any);
            // @ts-ignore
            expect(JSON.parse(backStore.fastStore.set.args[0][1])).to.have.property('test', 'session');

            expect(error).to.be.equal(null);

            done();
        });
    });

    it('should call the callback with the error exception message if redis.set throws', (done) => {
        // @ts-ignore
        stub = sinon.stub(backStore.fastStore, 'set').throws('test-name', 'test-message');

        try {
            backStore.set('test-session-id', { test: 'session' }, (error) => {
                expect(error).to.be.equal('test-name: test-message');
                done();
            });
        }
        catch (e) {
            debugger;
        }
    });

    it('should return the correct session', (done) => {
        backStore.get('key1', (error: string, session: any) => {
            expect(session).to.deep.equal({ session: 1 });
            done();
        });
    });

    it('should correctly set the expire value', (done) => {
        // @ts-ignore
        stub = sinon.stub(backStore.fastStore, 'set').returns(Promise.resolve());

        backStore.set('test-session-id', { test: 'session' }, (error) => {
            // @ts-ignore
            expect(backStore.fastStore.set).to.have.been.calledWith(
                sinon.match.any,
                sinon.match.any,
                10);

            done();
        });
    });

    it('should call expire on the redis dependency when touch is called', (done) => {
        // @ts-ignore
        stub = sinon.stub(backStore.fastStore, 'expire').returns(Promise.resolve());

        backStore.touch('test-session-id', { test: 'session' }, (error) => {
            // @ts-ignore
            expect(backStore.fastStore.expire).to.have.been.calledWith(
                sinon.match.any,
                10);

            done();
        });
    });

    it('should destroy a session', (done) => {
        // @ts-ignore
        stub = sinon.stub(backStore.fastStore, 'del').returns(Promise.resolve());

        backStore.destroy('test-session-id', (error) => {
            // @ts-ignore
            expect(backStore.fastStore.del).to.have.been.calledWith('pictaccio-backstore-test-session-id');

            done();
        });
    });

    it('should clear all sessions', (done) => {
        // @ts-ignore
        stub = sinon.stub(backStore.fastStore, 'del').returns(Promise.resolve());

        backStore.clear((error) => {
            // @ts-ignore
            expect(backStore.fastStore.del).to.have.been.calledWith(['pictaccio-backstore-key1', 'pictaccio-backstore-key2']);

            done();
        });
    });

    it('should return the correct length', (done) => {
        backStore.length((error, length) => {
            // @ts-ignore
            expect(length).to.be.equal(2);

            done();
        });
    });

    it('should return all sessions', (done) => {
        backStore.all((error, sessions) => {
            // @ts-ignore
            expect(sessions[0].session).to.be.equal(1);
            expect(sessions[1].session).to.be.equal(2);
            done();
        });
    });
});
