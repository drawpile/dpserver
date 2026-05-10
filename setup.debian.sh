#!/bin/bash
packages=()
while [[ $# -ne 0 ]]; do
    case "$1" in
    curl)
        packages+=('curl')
        ;;
    dialog)
        packages+=('dialog')
        ;;
    docker)
        packages+=('docker.io')
        ;;
    docker-compose)
        packages+=('docker-compose')
        ;;
    git)
        packages+=('git')
        ;;
    htpasswd)
        packages+=('apache2-utils')
        ;;
    *)
        echo "Don't know which package to install for $1" 1>&2
        exit 1
        ;;
    esac
    shift
done

if [[ $EUID -eq 0 ]]; then
    set -x
    apt update && apt install "${packages[@]}"
else
    set -x
    sudo apt update && sudo apt install "${packages[@]}"
fi
