#!/bin/sh
# Runs once at container start: nginx's /docker-entrypoint.sh executes every *.sh in /docker-entrypoint.d/.
#
# Vite inlines import.meta.env at build time, so Dockerfile.frontend builds the bundle with the literal
# placeholder "MY_APP_API_BASE_URL" (ENV VITE_API_BASE_URL). This script replaces every MY_APP_*
# placeholder in the built assets with the value of the container env var of the same name.
#
# Notes:
#   - The files are edited in place, so this only works on a freshly *created* container. After changing
#     a MY_APP_* value, recreate the container (docker compose up -d --force-recreate frontend);
#     a plain restart does nothing because the placeholder is already gone.
#   - Values must be bare (no surrounding quotes); they are inserted into JS string literals verbatim.
#   - Asset file names (content hashes) do not change, so a browser that cached a bundle with the
#     placeholder keeps serving it until a hard reload or the next release.
set -eu

HTML_DIR=/usr/share/nginx/html
REQUIRED_VARS="MY_APP_API_BASE_URL"

# Fail fast: a missing value would leave the placeholder in the bundle and the app would throw
# "There is an error with your environment variables." in the browser, with nothing in the container logs.
for name in $REQUIRED_VARS; do
    eval "value=\${$name:-}"
    if [ -z "$value" ]; then
        echo "env.sh: required environment variable $name is not set or is empty, refusing to start" >&2
        exit 1
    fi
done

# Longest key first, so a key that is a prefix of another (MY_APP_API vs MY_APP_API_BASE_URL)
# cannot clobber the longer placeholder.
env | grep '^MY_APP_' | awk -F= '{ print length($1), $0 }' | sort -rn | cut -d' ' -f2- |
while IFS= read -r line; do
    key=${line%%=*}
    value=${line#*=}
    # Escape the characters that are special in the sed replacement (\ and &) and our | delimiter.
    escaped=$(printf '%s' "$value" | sed -e 's/[&|\\]/\\&/g')
    echo "env.sh: $key=$value"
    find "$HTML_DIR" -type f \( -name '*.js' -o -name '*.css' \) -exec sed -i "s|$key|$escaped|g" '{}' +
done
