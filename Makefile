# build-test
bt:
	-@powershell -Command "Stop-Process -Name python -ErrorAction SilentlyContinue"
	-@powershell -Command "Stop-Process -Name ngrok -ErrorAction SilentlyContinue"
	powershell -Command "Start-Process python -ArgumentList '-m http.server 8000' -WorkingDirectory './dist' -WindowStyle Minimized"
	powershell -Command "Start-Process ngrok -ArgumentList 'http 8000' -WindowStyle Minimized"
	@timeout /t 5
	python display_qr.py

dir@%:
	mkdir -p ./public/assets/images/posts/$*


stop:
	@echo "Stopping services..."
	-@powershell -Command "Stop-Process -Name python -ErrorAction SilentlyContinue"
	-@powershell -Command "Stop-Process -Name ngrok -ErrorAction SilentlyContinue"


btl:
	-@powershell -Command "Stop-Process -Name python -ErrorAction SilentlyContinue"
	-@powershell -Command "Stop-Process -Name ngrok -ErrorAction SilentlyContinue"
	npm run build
	powershell -Command "Start-Process python -ArgumentList '-m http.server 8000' -WorkingDirectory './dist' -WindowStyle Minimized"
	powershell -Command "Start-Process ngrok -ArgumentList 'http 8000' -WindowStyle Minimized"
	@timeout /t 5
	python display_qr.py
