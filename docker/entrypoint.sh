#!/bin/sh
set -eu

cd /var/www/html

mkdir -p \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    database

if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    touch "${DB_DATABASE:-/var/www/html/database/database.sqlite}"
fi

chown -R www-data:www-data storage bootstrap/cache database

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    runuser -u www-data -- php artisan migrate --force
    runuser -u www-data -- php artisan storage:link --force
    runuser -u www-data -- php artisan optimize
fi

if [ "$1" = "apache2-foreground" ]; then
    exec "$@"
fi

exec runuser -u www-data -- "$@"

