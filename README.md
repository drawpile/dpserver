# Drawpile Community Server All-In-One Package

This is a all-in-one package for quickly setting up a Drawpile server with
all the extra features on a fresh new virtual machine.

Prerequisites:

 * A server (you can rent one from Linode, Digital Ocean, Google Cloud, AWS, Azure, etc.)
 * OS: Debian, Ubuntu and Arch are known to work. Other Linux distributions should work too, but you'll probably have to install the prerequisite packages manually.
 * Not strictly necessary, but a good idea: a domain for your server. You will need this if you want to use Let's Encrypt.

This package provides:

 * Drawpile-srv
 * A list server
 * Abuse report bridge
 * A web server (nginx)
 * Certbot for automatically setting up a HTTPS certificate
 * Drawpile server web admin frontend
 * A simple web site with a live session list
 * WebSocket support for the web browser version of Drawpile

To install, first git clone this repository (e.g. in root's home directory, you may need to install `git` first):

    git clone https://github.com/drawpile/dpserver.git

Next, run the setup script:

    cd dpserver
    ./setup.sh

The script will install all the dependencies and ask you for local configuration settings.
For the basic use case, the server will be ready to go afterwards.


## Customizing

The setup script creates a file named `.env` in the dpserver directory.
There, you can set environment variables that are used by docker-compose.

If you want to add additional features, or customize other settings, the best
way is to create an override file named `docker-compose.override.yaml`.
Docker compose will merge this file with the base `docker-compose.yaml` so you
can add and change settings to your liking. Using an override file makes it
easier to update the package later by simply running `git pull`

### The list server

The default configuration for the list server has it run in read only mode,
meaning it will only proxy the session list from the running server and not
accept any announcements from other servers.

To change this, add the following to your override file:

    version: "3.7"
    services:
        listserver:
            environment:
                LS_DATABASE: memory

For more info, see: https://github.com/drawpile/listserver 

### Web site

The directory `public_html` contains the website files. Modify them to your liking.
Make sure to point the `<meta name="drawpile:list-server">` at the right domain!

### Session templates

You can put session templates in the `session-templates` directory.

### Using your own web server

If you already have a web server on your machine, you will probably not want to use the dockerized nginx.
Make the following changes to the docker-compose file:

 * Remove the `nginx:` section entirely
 * The `certbot` volume can also be removed
 * Add `- "127.0.0.1:27780:27780"` to drawpile-srv section's `ports` list
 * Add a `ports:` list to the `listserver` section with the following value: `- "127.0.0.1:8080:8080`

Then simply configure your web server to proxy pass the paths you wish to the local ports 27780 and 8080.
Look at `nginx-config/default.conf` for an example. (You can change these port numbers too, if you wish.)


## Running the server

When you've configured the server to your liking, you can start it by running:

    docker-compose up -d

To update everything, run:

    docker-compose pull
    docker-compose up -d

To shut everything down, run:

    docker-compose stop


