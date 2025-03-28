#!/bin/bash
set -ex
cd "$(dirname "$0")"

version='0.11.0'
curl -L "https://github.com/drawpile/dpwebadmin/releases/download/$version/dpwebadmin-$version.tar.gz" | tar xz

rm -rf public_html/admin
mv "dpwebadmin-$version" public_html/admin
