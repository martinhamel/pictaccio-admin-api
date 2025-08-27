#!/usr/bin/env sh

current_dir=$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )

initdb --pgdata=/var/lib/postgresql/data
postgres&
sleep 10
createdb pictaccio
psql pictaccio -U postgres < $current_dir/seed.sql
echo "DB Init and seeded"
