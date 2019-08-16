import httpContext from 'express-http-context';
import uuid4 from 'uuid';

const Tracing = {
    correlationId() {
        return httpContext.get('correlationId');
    },

    middleware(req, res, next) {
        httpContext.middleware(req, res, () => {
            if (req.header('nginxId')) {
                httpContext.set('correlationId', req.header('nginxId'));
            } else {
                httpContext.set('correlationId', uuid4());
            }
            next();
        });
    }
};

export default Tracing;
