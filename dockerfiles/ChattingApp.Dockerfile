FROM node:10.15.3-alpine

RUN mkdir -p node/dp-dating/chattingapp

ENV DIR node/dp-dating/chattingapp
ENV PORT 3002

ADD ./node_modules node/dp-dating/node_modules
ADD ./chattingapp node/dp-dating/chattingapp
ADD ./package.json node/dp-dating
ADD ./config node/dp-dating/config
ADD ./tsconfig.json node/dp-dating/

WORKDIR ${DIR}

RUN npm install -g concurrently typescript

EXPOSE 3002

