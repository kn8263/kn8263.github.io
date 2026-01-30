# --- 設定 ---
SCRIPT := display_qr.py
PORT   := 8000
DIST   := ./dist

# --- 共通処理の定義 ---
# サービスの停止
define stop_services
	@echo "Stopping python and ngrok..."
	-@powershell -Command "Stop-Process -Name uv, python, ngrok -ErrorAction SilentlyContinue"
endef

# サーバーとngrokの同時起動
# $(1): サーバー実行コマンド ('python' または 'uv run python')
define start_services
	powershell -Command "Start-Process $(firstword $(1)) -ArgumentList '$(wordlist 2, 99, $(1)) -m http.server $(PORT)' -WorkingDirectory '$(DIST)' -WindowStyle Minimized"
	powershell -Command "Start-Process ngrok -ArgumentList 'http $(PORT)' -WindowStyle Minimized"
endef

# --- 実行コマンド ---

# Python直叩き (Build Test)
bt:
	$(MAKE) _run-test P_CMD="python"

# uv経由 (Build Test UV)
btu:
	$(MAKE) _run-test P_CMD="uv run"

# npm build を含むフルテスト
blt:
	$(stop_services)
	npm run build
	$(MAKE) _run-test P_CMD="python"

bltu:
	$(stop_services)
	npm run build
	$(MAKE) _run-test P_CMD="uv run"

# 内部共通タスク (直接は叩かない)
_run-test:
	$(stop_services)
	$(call start_services, $(P_CMD))
	@timeout /t 5
	$(P_CMD) $(SCRIPT)

# --- その他 ---

stop:
	$(stop_services)

serve:
	uv run python -m http.server $(PORT)

dir@%:
	mkdir -p ./public/assets/images/posts/$*
