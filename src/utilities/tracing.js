const createNamespace = require('cls-hooked').createNamespace;
const session = createNamespace('requestId');

const Tracing = {
    correlationId() {
        return session.get('correlationId');
    },

    setCorrelationId(correlationId) {
        session.set('correlationId', correlationId);
    }
};

export default Tracing;
