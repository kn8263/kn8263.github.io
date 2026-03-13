# ホームページ生成

<https://kn8263.github.io/>

以下の MIT License のソースコードを参考にして作成し、Astro.jsに移行しました。
<https://github.com/ixartz/Next-js-Blog-Boilerplate.git><br>
Special thanks go to ixartz/Next-js-Blog-Boilerplate

<hr>
<hr>
<hr>





### 自分用メモ
#### 記事作成時のローカルチェック
```bash
npm run dev
```
- `http://localhost:4321`で表示確認
<br>
<hr>
<br>

#### ローカルでのbuildチェック
```bash
npm run preview
```
- `http://localhost:4322`で表示確認
<br>
<hr>
<br>

#### ローカルでのbuildチェック(モバイル確認用)
※ngrokとngrokで一時公開中のURLのQRコードをpythonで生成
```bash
# build
npm run build


# build済みの表示確認
## uv経由
make btu
## python
make bt


# buildと表示確認両方
## uv経由
make bltu
## python
make blt
```

- (mobil): QRコード読取
- (desktop): `http://localhost:8000` | 生成されたURL
