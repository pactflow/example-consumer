ARG NODE_VERSION=20.11

FROM node:${NODE_VERSION}

WORKDIR /test

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY .env .env
COPY Makefile Makefile
RUN  npm install

COPY src src
# Allow github actions to write to this directory
RUN mkdir pacts
RUN chmod 777 pacts

ENV  HOME /home/node
USER node


CMD ["make", "test"]
