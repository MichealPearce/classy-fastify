echo 'cleaning...'
rm -rf dist

echo 'compiling esm...'
tsc --module esnext --target esnext --outDir dist/esm

echo 'compiling cjs...'
tsc --module commonjs --target esnext --outDir dist/cjs
