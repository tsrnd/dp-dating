FROM node:10.15.3-alpine

RUN mkdir -p node/dp-dating/datingapp

ENV DIR node/dp-dating/datingapp
ENV PORT 3001

ADD ./node_modules node/dp-dating/node_modules
ADD ./datingapp node/dp-dating/datingapp
ADD ./package.json node/dp-dating
ADD ./config node/dp-dating/config
ADD ./tsconfig.json node/dp-dating/

WORKDIR ${DIR}

RUN npm install -g concurrently typescript

EXPOSE 3001
