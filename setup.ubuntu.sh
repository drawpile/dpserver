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
        if [[ "$(lsb_release -rs | perl -0777 -ne '/([0-9]+)\.[0-9]+/ && print "$1"')" -gt 20 ]]; then
            packages+=('docker-compose-v2')
        else
            packages+=('docker-compose')
        fi
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
