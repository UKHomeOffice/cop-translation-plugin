import bodyParser from 'body-parser';
import express from 'express';
import expressValidator from 'express-validator';
import route from './routes';
import appConfig from './config/appConfig'
import Redis from 'ioredis';
import Keycloak from 'keycloak-connect';
import helmet from 'helmet';
import DataDecryptor from "./services/DataDecryptor";
import DataContextFactory from "./services/DataContextFactory";
import PlatformDataService from "./services/PlatformDataService";
import ProcessService from "./services/ProcessService";
import FormTranslator from "./form/FormTranslator";
import FormEngineService from "./services/FormEngineService";
import WorkflowEngineService from "./services/WorkflowEngineService";
import FormDataResolveController from "./controllers/FormTranslateController";
import WorkflowTranslationController from "./controllers/workflowTranslationController";

import logger from './config/winston';
import Tracing from "./utilities/tracing";
import cors from 'cors';
import BusinessKeyGenerator from "./services/BusinessKeyGenerator";

const http = require('http');
const https = require('https');
const fs = require('fs');

const kcConfig = {
    clientId: appConfig.keycloak.clientId,
    serverUrl: appConfig.keycloak.url,
    realm: appConfig.keycloak.realm,
    bearerOnly: true
};

const app = express();

const port = appConfig.port;

app.set('port', port);

const keycloak = new Keycloak({}, kcConfig);

const path = appConfig.privateKey.path;

logger.info('Private key path = ' + path);
// const ecKey = Buffer.from(fs.readFileSync(path));
logger.info('EC Key content resolved');

// const dataDecryptor = new DataDecryptor(ecKey);

function checkRedisSSL(redisSSl){
    if(redisSSl) {
        const redis = new Redis({
            host: `${appConfig.redis.url}`,
            port: appConfig.redis.port,
            password: appConfig.redis.token,
            tls: {}
        });
        return redis;
    } else {
        const redis = new Redis({
            host: `${appConfig.redis.url}`,
            port: appConfig.redis.port,
            password: appConfig.redis.token,
        });
        return redis;
    }
}

const redis = checkRedisSSL(appConfig.redis.ssl);

const dataContextFactory = new DataContextFactory(new PlatformDataService(appConfig), new ProcessService(appConfig));
const referenceGenerator = new BusinessKeyGenerator(redis);
const translator = new FormTranslator(new FormEngineService(appConfig), dataContextFactory, null, referenceGenerator);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(helmet());
app.use(keycloak.middleware());
app.use(Tracing.middleware);

if (appConfig.cors.origin) {
    app.use(cors({
        origin: appConfig.cors.origin.split('|'),
        optionsSuccessStatus: 200
    }));
}

app.use('/api/translation', route.allApiRouter(keycloak, new FormDataResolveController(translator), new WorkflowTranslationController(new WorkflowEngineService(appConfig))));

const server = http.createServer(app).listen(app.get('port'), function () {
    logger.info('Listening on port %d', port);
});

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
process.on('SIGQUIT', shutDown);

let connections = [];

server.on('connection', connection => {
    connections.push(connection);
    connection.on('close', () => connections = connections.filter(curr => curr !== connection));
});

function shutDown() {
    logger.info('Received kill signal, shutting down gracefully');
    server.close(() => {
        logger.info('Closed out remaining connections');
        process.exit(0);
    });

    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);

    connections.forEach(curr => curr.end());
    setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}


module.exports = app;
