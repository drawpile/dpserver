# See: https://ilhicas.com/2019/03/02/Nginx-Letsencrypt-Docker.html
FROM nginx:alpine
ARG DOMAIN
ARG EMAIL

RUN apk add inotify-tools certbot openssl

WORKDIR /opt
COPY setup.sh /opt/
RUN /bin/sh setup.sh
COPY entrypoint.sh certbot.sh /opt/

ENTRYPOINT [ "/bin/sh", "/opt/entrypoint.sh" ]

