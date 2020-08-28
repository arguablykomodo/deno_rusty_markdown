#!/bin/sh
OLD="$(find pkg -type f -print0 | sort -z | xargs -r0 md5sum | md5sum)"
echo "$OLD"
deno run --allow-read --allow-write --allow-run scripts/build.ts
NEW="$(find pkg -type f -print0 | sort -z | xargs -r0 md5sum | md5sum)"
echo "$NEW"
if [ "$OLD" != "$NEW" ]; then exit 1; fi
