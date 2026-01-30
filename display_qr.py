import urllib.request
import json
import time
import qrcode
import sys


def get_ngrok_url():
    # ngrokのAPIからURLを取得
    for _ in range(10):  # 最大10回リトライ
        try:
            with urllib.request.urlopen(
                "http://localhost:4040/api/tunnels"
            ) as response:
                data = json.loads(response.read().decode())
                return data["tunnels"][0]["public_url"]
        except Exception:
            time.sleep(1)
    return None


def main():
    url = get_ngrok_url()
    if url:
        print(f"\nForwarding URL: {url}")
        print("http://localhost:8000")
        # ターミナル上にQRコードを表示
        qr = qrcode.QRCode()
        qr.add_data(url)
        qr.make()
        qr.print_ascii(invert=True)

        # サーバーを維持するために待機
        print(
            "\n[Ctrl+C] でQR表示を終了します（サーバーは make stop で止めてください）"
        )
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            sys.exit(0)
    else:
        print("ngrokのURLが取得できませんでした。")


if __name__ == "__main__":
    main()
