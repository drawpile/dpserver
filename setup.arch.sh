#!/bin/bash
packages=(apache curl dialog docker docker-compose git)
if [[ $EUID -eq 0 ]]; then
    set -x
    pacman -S "${packages[@]}"
else
    set -x
    sudo pacman -S "${packages[@]}"
fi
