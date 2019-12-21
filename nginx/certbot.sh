#!/bin/sh

certbot certonly \
        --config-dir /etc/certbot \
		--agree-tos \
		--domains "$DOMAIN" \
		--email "$EMAIL" \
		--expand \
		--noninteractive \
		--webroot \
		--webroot-path /var/www/certbot

if [[ -f "/etc/certbot/live/$DOMAIN/privkey.pem" ]]; then
    cp "/etc/certbot/live/$DOMAIN/privkey.pem" /usr/share/nginx/certificates/privkey.pem
    cp "/etc/certbot/live/$DOMAIN/fullchain.pem" /usr/share/nginx/certificates/fullchain.pem
fi

