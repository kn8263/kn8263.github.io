# build-test
bt:
	cd dist && python -m http.server 8000

dir@%:
	mkdir -p ./public/assets/images/posts/$*
