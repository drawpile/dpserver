#!/bin/bash

exec 3>&1

# First an accident check
if [[ -f .env ]]
then
	dialog --defaultno --yesno "A .env file already exist. Proceed and overwrite?" 0 0
	if [[ $? != 0 ]]
	then
		clear
		echo "Cancelled."
		exit 0
	fi
fi

# Domain name (required)
domain=""
while [[ "$domain" == "" ]]
do

domain=$(dialog --inputbox "Enter your domain name" 0 0 2>&1 1>&3)

if [[ $? != 0 ]]
then
	clear
	echo "Cancelled."
	exit 1
fi

done

# Certbot (optional)
email=""
dialog --yesno "Do you want a Let's Encrypt certificate for HTTPS?" 7 40

if [[ $? == 0 ]]
then
	while [[ "$email" == "" ]]
	do

	email=$(dialog --inputbox "Enter your email address (for Let's Encrypt)" 0 0 2>&1 1>&3)

	if [[ $? != 0 ]]
	then
		break
	fi
	done
fi

# Abuse report webhook (optional)
discord_webhook=$(dialog --inputbox "If you have a Discord channel you'd like to send abuse reports to, paste the webhook URL here:" 0 0 2>&1 1>&3)

echo "DOMAIN=$domain" > .env

if [[ "$email" != "" ]]
then
	echo "USE_CERTBOT=yes" >> .env
	echo "EMAIL=$email" >> .env
else
	echo "USE_CERTBOT=no" >> .env
	echo "EMAIL=" >> .env
fi

echo "DISCORD_WEBHOOK=$discord_webhook" >> .env

sed -i "s/__DOMAIN__/${domain}/" public_html/index.html

