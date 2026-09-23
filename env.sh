#!/bin/sh
for i in $(env | grep MY_APP_) // Make sure to use the prefix MY_APP_ if you have any other prefix in env.production file variable name replace it with MY_APP_
do
    key=$(echo $i | cut -d '=' -f 1)
    value=$(echo $i | cut -d '=' -f 2-)
    echo $key=$value
    find /usr/share/nginx/html -type f \( -name '*.js' -o -name '*.css' \) -exec sed -i "s|${key}|${value}|g" '{}' +
done