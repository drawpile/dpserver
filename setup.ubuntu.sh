#!/bin/bash

if [[ "$(lsb_release -rs | perl -0777 -ne '/([0-9]+)\.[0-9]+/ && print "$1"')" -gt 20 ]]; then
    packages=(apache2-utils curl dialog docker.io docker-compose-v2 git)
else
    packages=(apache2-utils curl dialog docker.io docker-compose git)
fi

if [[ $EUID -eq 0 ]]; then
    set -x
    apt update && apt -y install "${packages[@]}"
else
    set -x
    sudo apt update && sudo apt -y install "${packages[@]}"
fi
