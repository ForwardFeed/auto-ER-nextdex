#!/usr/bin/env bash

fix-esm-import-path ./static/js/fetcher/

sed -i "s/path-browserify'/.\/path-browserify.js'/g" ./static/js/fetcher/internal_id.js
sed -i "s/path-browserify'/.\/path-browserify.js'/g" ./static/js/fetcher/locations.js
sed -i "s/path-browserify'/.\/path-browserify.js'/g" ./static/js/fetcher/main.js
sed -i "s/path-browserify'/.\/path-browserify.js'/g" ./static/js/fetcher/moves.js
sed -i "s/path-browserify'/.\/path-browserify.js'/g" ./static/js/fetcher/utils.js
sed -i "s/path-browserify'/..\/path-browserify.js'/g" ./static/js/fetcher/additional_data/additional.js

sed -i "s/import \* as Path/import Path/g" ./static/js/fetcher/internal_id.js
sed -i "s/import \* as Path/import Path/g" ./static/js/fetcher/locations.js
sed -i "s/import \* as Path/import Path/g" ./static/js/fetcher/main.js
sed -i "s/import \* as Path/import Path/g" ./static/js/fetcher/moves.js
sed -i "s/import \* as Path/import Path/g" ./static/js/fetcher/utils.js
sed -i "s/import \* as Path/import Path/g" ./static/js/fetcher/additional_data/additional.js