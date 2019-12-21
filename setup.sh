#!/bin/bash

# First of all, we need to install the basic dependencies.
# This is distro specific.
DISTRO=$(lsb_release -is)
bash ./setup.$DISTRO.sh || (echo "There is no setup script for $DISTRO :(" ; exit 1)


mkdir -p session-templates

if [[ ! -d webadmin ]]
then
	./update-webadmin.sh
fi

if [[ ! -f nginx-config/htpasswd ]]
then
	./set-webadmin-password.sh
fi

if [[ ! -f .env ]]
then
	./configure.sh
fi

clear
echo "Setup complete. Refer to README.md for extra changes you might want to make."
echo "To start the server, run: docker-compose up -d"

