import BusinessKeyGenerator from "../../src/services/BusinessKeyGenerator";
import {expect} from 'chai';
import MockRedis from 'ioredis-mock';
import sinon from 'sinon'

import itParam from 'mocha-param';
import moment from "moment";


describe('BusinessKeyGenerator', () => {
    const dataKey = `BF-20190812`;
    const mockRedis = new MockRedis({
        data: {
            [dataKey]: 0
        }
    });

    after(() => {
        mockRedis.disconnect()
    });
    itParam("can generate business key with ${value.date} and suffix count to be ${value.expectedCount}", [
            {date: new Date(2019, 7, 12), expectedCount: 1, prefix: null},
            {date: new Date(2019, 7, 12), expectedCount: 2, prefix: null},
            {date: new Date(2019, 7, 12), expectedCount: 3, prefix: null},
            {date: new Date(2019, 7, 12), expectedCount: 4, prefix: null},
            {date: new Date(2019, 7, 12), expectedCount: 1, prefix: 'XQ'},
            {date: new Date(2019, 7, 12), expectedCount: 2, prefix: 'XQ'},
            {date: new Date(2019, 7, 12), expectedCount: 3, prefix: 'XQ'},
            {
                date: new Date(2019, 7, 13, 23, 59, 59),
                expectedCount: 1, prefix: null
            },
            {
                date: new Date(2019, 7, 14, 0, 0, 0),
                expectedCount: 1, prefix: null
            }
        ],
        async (data) => {

            const marchEpochTime = Math.round(data.date.getTime());
            const clock = sinon.useFakeTimers();
            clock.tick(marchEpochTime);

            const businessKeyGenerator = new BusinessKeyGenerator(mockRedis);
            const businessKey = await businessKeyGenerator.newBusinessKey(data.prefix);
            const prefix = data.prefix ? `${data.prefix}` : `BF`;
            expect(businessKey).to.be.eq(`${prefix}-${moment(data.date).format('YYYYMMDD')}-${data.expectedCount}`);
        });


});
