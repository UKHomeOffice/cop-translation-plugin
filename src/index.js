import bodyParser from 'body-parser';
import express from 'express';
import expressValidator from 'express-validator';
import route from './routes';
import appConfig from './config/appConfig'

const http = require('http');
const https = require('https');
const fs = require('fs');

import Keycloak from 'keycloak-connect';
import helmet from 'helmet';
import DataDecryptor from "./services/DataDecryptor";
import DataContextFactory from "./services/DataContextFactory";
import PlatformDataService from "./services/PlatformDataService";
import ProcessService from "./services/ProcessService";
import FormTranslator from "./form/FormTranslator";
import FormEngineService from "./services/FormEngineService";
import FormDataResolveController from "./controllers/FormTranslateController";

import logger from './config/winston';
import Tracing from "./utilities/tracing";
import cors from 'cors';


if (process.env.NODE_ENV === 'production') {
    logger.info('Setting ca bundle');
    const trustedCa = [
        '/etc/ssl/certs/ca-certificates.crt'
    ];

    https.globalAgent.options.ca = [];
    for (const ca of trustedCa) {
        https.globalAgent.options.ca.push(fs.readFileSync(ca));
    }
    logger.info('ca bundle set...');
}

const kcConfig = {
    clientId: process.env.AUTH_CLIENT_ID,
    serverUrl: process.env.AUTH_URL,
    realm: process.env.AUTH_REALM,
    bearerOnly: true
};

const app = express();

const port = process.env.PORT || 8080;

app.set('port', port);

const keycloak = new Keycloak({}, kcConfig);

const path = appConfig.privateKey.path;

logger.info('Private key path = ' + path);
const rsaKey = fs.readFileSync(path);
logger.info('RSA Key content resolved');

const dataDecryptor = new DataDecryptor(rsaKey);
const dataContextFactory = new DataContextFactory(new PlatformDataService(appConfig), new ProcessService(appConfig));
const translator = new FormTranslator(new FormEngineService(appConfig), dataContextFactory, dataDecryptor);

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

app.use('/api/translation', route.allApiRouter(keycloak, new FormDataResolveController(translator)));

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
