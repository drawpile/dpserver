#!/bin/sh

if [ "$USE_CERTBOT" == "yes" ]
then
	echo "Activating certbot..."
	mkdir -p /var/www/certbot

	$(while :; do sh /opt/certbot.sh; sleep 12h; done;) &

	$(while inotifywait -e close_write /usr/share/nginx/certificates; do nginx -s reload; done) &
fi

exec nginx -g "daemon off;"

