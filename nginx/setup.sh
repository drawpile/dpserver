#!/bin/sh

# Note: this is to be run inside the container during build phase!

# Create a default self-signed certificate to use until certbot is run
mkdir /usr/share/nginx/certificates

openssl genrsa -out /usr/share/nginx/certificates/privkey.pem 4096
openssl req -new -key /usr/share/nginx/certificates/privkey.pem -out /usr/share/nginx/certificates/cert.csr -nodes -subj \
	"/C=PT/ST=World/L=World/O=${DOMAIN}/OU=drawpile lda/CN=${DOMAIN}/EMAIL=${EMAIL}"
openssl x509 -req -days 365 -in /usr/share/nginx/certificates/cert.csr -signkey /usr/share/nginx/certificates/privkey.pem -out /usr/share/nginx/certificates/fullchain.pem

