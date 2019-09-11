import moment from "moment";
import _ from 'lodash';

export default class BusinessKeyGenerator {

    constructor(redis) {
        this.redis = redis;
    }

    async newBusinessKey(prefix = null) {
        let today = moment();
        const currentDate = today.format("YYYYMMDD");
        const key = _.isEmpty(prefix) ? `BF-${currentDate}` : `${prefix}-${currentDate}`;
        const expiryAt = today.add(1, 'day').unix();

        const count = await this.redis.multi()
            .incr(key)
            .expireat(key, expiryAt)
            .exec();

        return `${key}-${count[0][1]}`;
    }


}
