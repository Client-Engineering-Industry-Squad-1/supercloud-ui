FROM registry.access.redhat.com/ubi8/nodejs-16:1-90 as builder

USER root

RUN dnf -y install autoconf automake diffutils file && \
    dnf clean all

USER default

WORKDIR /opt/app-root/src

COPY --chown=default:root . .
RUN npm install && \
    npm run build

FROM registry.access.redhat.com/ubi8/nodejs-16-minimal:1-98

USER 1001

WORKDIR /opt/app-root/src

COPY --from=builder --chown=1001:0 /opt/app-root/src/dist ./dist
COPY --chown=1001:0 package.json package-lock.json ./
COPY --chown=1001:0 server ./server
COPY --chown=1001:0 config ./config

RUN chmod -R g+w ./dist && \
    npm i -g yarn && \
    yarn install --production && \
    yarn cache clean

ENV NODE_ENV=production
ENV HOST=0.0.0.0 PORT=3000

EXPOSE 3000/tcp

CMD ["npm", "start"]