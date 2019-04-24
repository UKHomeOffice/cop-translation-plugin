import httpContext from 'express-http-context';

const Tracing = {
    correlationId() {
        return httpContext.get('correlationId');
    },

    middleware(req, res, next) {
        httpContext.middleware(req, res, () => {
            httpContext.set('correlationId', req.header('nginxId'));
            next();
        });
    }
};

export default Tracing;
