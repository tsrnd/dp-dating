FROM node:10.15.3-alpine

RUN mkdir -p node/dp-dating

ENV DIR node/dp-dating
ENV PORT 3001

ADD ./ node/dp-dating

WORKDIR ${DIR}

RUN npm install -g concurrently typescript

EXPOSE ${PORT}

CMD npm run build-development
