FROM quay.io/ukhomeofficedigital/docker-node:master

WORKDIR /app

RUN mkdir -p /app && \
    chown -R ${USER}:${GROUP} /app

ADD . /app/

RUN npm install && npm run build

ENV NODE_ENV='production'

USER ${USER}

EXPOSE 8080

ENTRYPOINT exec node dist/index.js

