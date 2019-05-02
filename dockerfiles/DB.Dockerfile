FROM mongo:3.4

ENV MONGO_INITCS_DB_ROOT_USERNAME=myuser \
    MONGO_INITCS_DB_ROOT_PASSWORD=mypass
ADD ./mongo-entrypoint.sh /docker-entrypoint-initdb.d/

WORKDIR /

CMD [ "mongod" ]

EXPOSE 27017
