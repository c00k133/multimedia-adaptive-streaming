#!/bin/bash
docker run --rm httpd:2.4 \
    cat /usr/local/apache2/conf/httpd.conf > clean-httpd.conf
