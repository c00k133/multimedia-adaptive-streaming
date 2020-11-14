#!/bin/bash
IMAGE='httpd:2.4'
PORT='8080'
docker run \
    --interactive \
    --tty \
    --rm \
    --name dash-apache \
    --publish "${PORT}":80 \
    --volume "${PWD}/htdocs:/usr/local/apache2/htdocs" \
    "${IMAGE}" \
    "$@"

xdg-open http://localhost:"${PORT}"
