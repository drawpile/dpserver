#!/bin/bash
cd "$(dirname "$0")" || exit 1

echo
echo 'Checking if prerequisites are installed...'
echo

error=0
for cmd in curl dialog docker git htpasswd; do
    if ! command -v "$cmd" >/dev/null 2>/dev/null; then
        echo "$cmd - NOT FOUND, must be installed" 2>&1
        error=1
    fi
done

if ! ( command -v docker >/dev/null 2>&1 && \
       docker compose version >/dev/null 2>&1 ) && \
   ! command -v docker-compose >/dev/null 2>&1; then
    echo "docker compose - NOT FOUND, must be installed" 2>&1
    error=1
fi

if [[ $error -eq 0 ]]; then
    echo 'All good.'
    echo
else
    echo 1>&2
    echo "Some of the required programs above are missing." 1>&2
    distro_script="setup.$(lsb_release -is | tr '[:upper:]' '[:lower:]').sh"
    if [[ -f "$distro_script" ]]; then
        echo
        echo "Attempting to install them using $distro_script..."
        echo
        bash "$distro_script" || exit 1
    else
        echo "Please install them first and run setup.sh again." 1>&2
        echo 1>&2
        exit 1
    fi
fi

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
echo "To start the server, run: ./docker-compose-wrapper up -d"

