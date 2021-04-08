#!/bin/sh
set -e
. /code/frontend/docker/scripts/base.sh

exec /sbin/su-exec user yarn serve --port $APP_PORT