FROM node:10.15.3-alpine

RUN mkdir -p node/dp-dating

ENV DIR node/dp-dating

ADD ./ node/dp-dating

WORKDIR ${DIR}

RUN npm install -g tslint typescript

CMD /bin/sh ./unittest.sh
