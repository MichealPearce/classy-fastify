echo 'cleaning...'
rm -rf dist

vite build

echo 'generating types...'
tsc --outDir dist
