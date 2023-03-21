#!/bin/bash

set -e 

# Get latest webadmin source code
if [[ ! -d dpwebadmin ]]
then
	git clone https://github.com/drawpile/dpwebadmin.git
	cd dpwebadmin
else
	cd dpwebadmin
	git pull
fi

# Local server specific configuration
cat > .env.local <<END
REACT_APP_APIROOT=/admin/api
REACT_APP_BASENAME=/admin
PUBLIC_URL=/admin
END

# Build
rm -rf build
docker run --rm -ti \
	--mount type=bind,source="$(pwd)",target=/app \
	-w=/app \
	-u=$UID \
	-e 'NODE_OPTIONS=--openssl-legacy-provider' \
	node:lts-alpine \
	/bin/sh -c "npm install --no-progress && npm run build"

# Replace existing webadmin deployment (if any) with the fresh build
cd ../public_html
rm -rf admin
mv ../dpwebadmin/build admin

