import uuid from 'uuid';
import httpContext from 'express-http-context';

const Tracing = {
    correlationId() {
        return httpContext.get('correlationId');
    },

    middleware(req, res, next) {
        httpContext.middleware(req, res, () => {
            httpContext.set('correlationId', uuid.v1());
            next();
        });
    }
};

export default Tracing;
