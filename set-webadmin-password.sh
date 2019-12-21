#!/bin/bash

PW_FILE=nginx-config/htpasswd

exec 3>&1

password=""
while [[ "$password" == "" ]]
do
	password=$(dialog --inputbox "Select a password for the web admin" 0 0 2>&1 1>&3)

	if [[ $? != 0 ]]
	then
		break
	elif [[ "$password" != "" ]]
	then
		touch $PW_FILE
		htpasswd -b $PW_FILE admin $password
	fi
done

