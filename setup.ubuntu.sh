#!/bin/bash
packages=(apache2-utils curl dialog docker.io docker-compose git)
if [[ $EUID -eq 0 ]]; then
    set -x
    apt update && apt -y install "${packages[@]}"
else
    set -x
    sudo apt update && sudo apt -y install "${packages[@]}"
fi

