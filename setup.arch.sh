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
        packages+=('docker')
        ;;
    docker-compose)
        packages+=('docker-compose')
        ;;
    git)
        packages+=('git')
        ;;
    htpasswd)
        packages+=('apache')
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
    pacman -S "${packages[@]}"
else
    set -x
    sudo pacman -S "${packages[@]}"
fi
