import bodyParser from 'body-parser';
import express from 'express';
import * as logger from 'winston';

import expressValidator from './utilities/validators';
import route from './routes';
import morgan from 'morgan';
const http = require('http');

const app = express();

const port = process.env.PORT || 3001;

app.set('port', port);

app.use(bodyParser.json());
app.use(morgan('common'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator);
app.use(route.allowCrossDomain);
app.use('/api', route.router);


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
    console.log('Received kill signal, shutting down gracefully');
    server.close(() => {
        console.log('Closed out remaining connections');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);

    connections.forEach(curr => curr.end());
    setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}


module.exports = app;
