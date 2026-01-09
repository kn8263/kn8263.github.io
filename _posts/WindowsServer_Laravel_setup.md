---
title: WindowsServer×Laravelの環境をHyper-Vに構築する
date: 2026-01-09T14:59:32+0900
template: post
draft: true
category: blog
description: XAMPPで開発が進んでいたプロジェクトの開発環境を本番環境であるWindowsServerに合わせて再構築しました。
tags:
  - Hyper-V
  - PHP
  - Laravel
  - WindowsServer
  - SQLServer
  - Mailpit
  - IIS
---

本番環境がWindowsServer指定だが、社内の経験者が多いという理由でLaravelが選択されたプロジェクトの後任になり、<br>XAMPPからWindowsServer×IIS×SQLServer2022の環境構築をした際の備忘録です。

## 使用したライブラリ・ツール等一覧
- [WindowsServer2022](https://www.microsoft.com/ja-jp/evalcenter/download-windows-server-2022)
- [SQL Server 2022](https://www.microsoft.com/ja-jp/sql-server/sql-server-downloads)
- [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/ja-jp/ssms/download-sql-server-management-studio-ssms?redirectedfrom=MSDN#available-languages)
- [PHP 8.2](https://windows.php.net/download#php-8.2)（Non-Threadsafe x64）
-   [Composer](https://getcomposer.org/doc/00-intro.md#installation-windows)
- Node.js ([NVM](https://github.com/coreybutler/nvm-windows/releases) )
- [Hyper-V](https://learn.microsoft.com/ja-jp/windows-server/virtualization/hyper-v/overview#get-started-with-hyper-v)
- [A5:SQL Mk-2](https://a5m2.mmatsubara.com/)
- [Mailpit](https://mailpit.axllent.org/docs/install/)
- Visual C++ Redistributable 2015-2022 [vc_redist.x64.exe](https://aka.ms/vs/17/release/vc_redist.x64.exe)
- URL Rewrite モジュール[IIS URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)

## 事前準備
### Hyper-V有効化
有効化していない場合[こちらの記事を参考に](https://tenshoku.mynavi.jp/engineer/guide/articles/Y0oYbBEAADssjiX9)
### ディレクトリの用意とWindowsServerのisoファイルダウンロード
`C:\vm_iso`、`C:\vm_share`のディレクトリを作成しておく(任意）
`C:\vm_iso`内にisoファイルを配置しておく

## 仮想マシン作成＋WindowsServerのインストール
### Hyper-Vマネージャー起動
`Windows`ボタン押下→Hyper-Vで検索
![Hyper-vマネージャー](Hyper-v.png)

### 仮想スイッチ(ネットワーク）の設定
- 画面右の仮想スイッチマネージャーを選択
![仮想スイッチマネージャー](virtual-network-switch.png)
- 仮想スイッチの作成で「内部」を選択して「仮想スイッチの作成」ボタンを押下
![仮想スイッチの作成](create-switch.png)
- 任意の名前（以降はInernalSwitchとします)を付けてOKボタンを押下
![スイッチ命名](InternalSwitch.png)
- ホストの「設定」を開き「ネットワークとインターネット」＞「ネットワークの詳細設定」＞**vEthernet(InernalSwitch)** ＞ **「追加のプロパティを表示」** を選択
![ネットワーク設定](network-setting.png)
- IPの割り当ての「「編集」ボタンを押下
- 以下のように設定して保存
	- IP 設定の編集: 手動
	- IPv4: オン

| 項目          | 値             |
| ----------- | ------------- |
| IPアドレス      | 192.168.200.1 |
| サブネットマスク    | 255.255.255.0 |
| ゲートウェイ      | (ブランク)        |
| 優先DNS       | (ブランク)        |
| HTTPS経由のDNS | オフ            |
| 代替DNS       | (ブランク)        |
| HTTPS経由のDNS | オフ            |
	- IPv6: オフ
![ip設定](ip-setting.png)

### 仮想マシン設定
- 画面右の「新規」＞「仮想マシン」を選択
![新規仮想マシン](create-vm.png)
- 以下のように進める
	- 開始する前に：　次へボタン
	- 名前と場所の指定：
		- 名前：　任意の名前　(WSV2022など)
		- 場所：　任意　（デフォルトでOK)
	- 世代の指定:　第2世代(2)
  ![第二世代](2nd.png)
	- メモリの割り当て：　4096　MB(任意のメモリ)
	- ネットワークの構成：　InternalSwitch
  ![ネットワークの構成](network-structure.png)
	- 仮想ハードディスクの接続：
		- 名前：　任意　（デフォルトでOK)
		- 場所：　任意　（デフォルトでOK)
		- サイズ：　任意　（60GB以上推奨)
	- インストールオプション：ブートイメージファイルからオペレーティングシステムをインストールする
		- メディア：　(インストールしたISOファイルのパスを指定)
  ![インストールメディア](install-ws.png)
	- 要約：　完了ボタンを押下



- 作成されたVMの設定を開く
![VM設定](vm-setting.png)
- 「ハードウェアの追加」から「ネットワークアダプター」を選択し「追加」ボタンを押下
- 仮想スイッチ：　Default Switch
- 適用ボタンを押下
![ネットワークアダプター](adapter.png)
- 左のメニューの「管理」＞「統合サービス」を選択し「ゲストサービス」にチェックを入れる
- OKボタンを押下
![ゲストサービス](guest.png)

### 仮想マシン起動・OSセットアップ
- 作成した仮想マシンを起動・接続する
- Press any keyなど出たら何かキーボードのボタンを押下する
	- ここで失敗したら仮想マシンのウィンドウの上部のメニューからリスタートする
- Hyper-V　が表示されたらOSのインストーラーが起動するまで待つ
- インストーラーが起動したら画面に沿ってインストールを進める
	- エディション：`Windows Server 2022 Standard (Desktop Experience)`
	- インストールの種類: カスタム
	- パスワード設定
- Windowsログイン画面が表示されたら設定したパスワードでログイン

---
## 仮想マシン内の環境構築
### 1. IIS(Webサーバー)の設定
**※XAMPPで開発したプログラムのソース一式をbookingappとします。**

**IISのインストール**

※仮想マシン内
1. 「サーバーマネージャー」 →「管理」→ 「役割と機能の追加」
2. 役割ベースまたは機能ベースのインストール→次へ
3. サーバープールからサーバーを選択（デフォルトのままでOK)→次へ
4. サーバーの役割：Webサーバー(IIS)にチェックし以下もチェックを入れて進める
	以下を選択
	- Webサーバー > アプリケーション開発 > CGI
    - Webサーバー > パフォーマンス > 静的なコンテンツの圧縮
    - 管理ツール > IIS 管理コンソール
5. インストール完了後、ブラウザで `http://localhost` にアクセスして **IISの初期ページが表示されるか確認**

Visual C++ Redistributable 2015-2022 をインストール
  [vc_redist.x64.exe](https://aka.ms/vs/17/release/vc_redist.x64.exe)

- URL Rewrite モジュールをインストール
  [IIS URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
#### アプリケーションプール等の設定
- IIS起動
- アプリケーションプール>右のメニューで「アプリケーションプールの追加」を選択。以下のように設定しOK

| 項目             | 値          |
| -------------- | ---------- |
| 名前             | kyg        |
| .Net CLRバージョン  | マネージドコードなし |
| マネージドパイプラインモード | 統合         |
- 「サイト」を右クリック→Webサイトの追加。以下のように設定しOK

| 項目          | 値                                    |
| ----------- | ------------------------------------ |
| サイト名        | kyg.local                            |
| アプリケーションプール | kyg                                  |
| 物理パス        | C:\inetpub\wwwroot\bookingapp\public |
| バインド)種類     | http                                 |
| バインド)IPアドレス | 未使用の IP アドレスすべて                      |
| バインド)ポート    | 80                                   |
| バインド）ホスト名   | kyg.local                            |

#### Hostsの設定(IIS外)
VM内でIP確認：
```
ipconfig
```
example
```
イーサネット アダプター イーサネット 2:

   接続固有の DNS サフィックス . . . . .:
   リンクローカル IPv6 アドレス. . . . .: fe80::c1d1:7cf9:df61:89d1%7
   IPv4 アドレス . . . . . . . . . . . .: 192.168.56.102
   サブネット マスク . . . . . . . . . .: 255.255.255.0
   デフォルト ゲートウェイ . . . . . . .:
```

`C:\Windows\System32\drivers\etc\hosts`に以下を追記
```
192.168.56.102       kyg.local
```



---

### 2. PHP 8.2 設定（Non-Threadsafe x64）

- PHP ZIP をダウンロード → `C:\php82` に解凍
  [PHP 8.2](https://windows.php.net/download#php-8.2)

- `php.ini-production` をコピーして `php.ini` を作成

- php.ini の編集例
```
extension_dir = "C:\php82\ext"

extension=curl
extension=gd
extension=mbstring
extension=php_sqlsrv_82_nts_x64.dll
extension=php_pdo_sqlsrv_82_nts_x64.dll
extension=fileinfo
```

- Microsoft PHP SQL Server ドライバを `C:\php82\ext` に配置
  [PHP Drivers for SQL Server](https://learn.microsoft.com/en-us/sql/connect/php/download-drivers-php-sql-server?view=sql-server-ver15#download)
※zipを解凍して以下のファイルを`C:\php82\ext`にコピーする
  - 必須ファイル：
    - php_sqlsrv_82_nts_x64.dll
    - php_pdo_sqlsrv_82_nts_x64.dll

- システム環境変数に `C:\php82` を追加

- IISマネージャー で PHP 8.2 を登録 (`php-cgi.exe`)
	1. IISマネージャー起動 > サーバーを選択(WIN-XXXXXX) > 画面中央のメニューの中から「ハンドラーマッピング」　を選択
	2. 画面右の「操作」メニュー内「モジュールマップの追加」を選択。以下の設定を記載しOK

| 項目              | 値                      |
| --------------- | ---------------------- |
| 要求パス            | `*.php`                |
| モジュール           | `FastCgiModule`        |
| 実行可能ファイル(オプション) | `C:\php82\php-cgi.exe` |
| 名前              | PHP_v8.2　(任意の名称で良い)    |

- FastCGIの設定
	サーバー選択 > FastCGIの設定 > 画面右操作メニューのアプリケーションの追加
		完全なパス: `C:\php82\php-cgi.exe`
		全般 > 環境変数 > コレクション
			Name: `PHPRC`
			Value: C:\php82

-  既定のドキュメント追加
	- サイト>kyg.localを選択し、「既定のドキュメント」を選択
	- 画面右　操作タブの「追加」から`index.php`を追加しOK
- 動作確認
  `C:\inetpub\wwwroot\index.php` に以下を作成
```php
<?php
echo phpinfo();
```
  ブラウザで `http://localhost/index.php` にアクセス

---

### 3. Composer の設定

- Composer をインストール  **(保存されるパスを環境変数設定用にメモしておく)**
  [Composer](https://getcomposer.org/doc/00-intro.md#installation-windows)

- PHP 実行パスを `C:\php82\php.exe` に設定

- システム環境変数に Composer のパスを追加

- バージョン確認
```cmd
composer -V
```

---

### 4. Node.js の設定
- [nvmのインストール(nvm-setup.exe)]([https://github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases))

バージョンチェック
```bash
nvm version
```
インストール可能なnode.jsバージョン確認
```bash
nvm list available
```
バージョン指定でインストール
```bash
nvm install 22.20.0
```
インストール済みのnode.jsのバージョン確認
```bash
nvm list
```
使用するnode.jsのバージョン指定
```bash
nvm use 22.20.0
```

- バージョン確認
```powershell
node -v
npm -v
```

---

### 5. SQL Server の設定

- SQL Server 2025 Developerをインストール [ダウンロード](https://www.microsoft.com/ja-jp/sql-server/sql-server-downloads)
- SSMSもインストール [ダウンロード](https://learn.microsoft.com/ja-jp/ssms/install/install)

- SQL Server Management Studio (SSMS) を起動
- 接続したら「データベース」を右クリックして「新しいデータベース」を選択
	- データベース名「kyg」を入力
	- OKをクリック
- サーバーインスタンス直下の「セキュリティ > ログイン」右クリック → 「新しいログイン」
	- ログイン名に **`IIS APPPOOL\kyg` と入力**（検索ボタンは押さない）
	- 「Windows 認証」を選択
	- 「ユーザー マッピング」で使用するデータベース（ `kyg`）にチェック
	- ロールとして `db_owner`（または必要な最低限の権限）を付与
	- OK をクリック

**TCP/IP設定**
- windowsのメニューから `「SQL Server2022構成マネージャー」` のアプリを起動する
- 画面左の`SQL Server ネットワークの構成`を選択
- `MSSQLSERVERのプロトコル`を選択

※TCP/IPが「有効」になっていない場合
 - クリックして開いたウィンドウの`プロトコルタブ`で`有効：いいえ`を`はい`に変更

- `IPアドレス`タブを選択しIPアドレス`127.0.0.1`(localhost)の`有効：いいえ`を`はい`に変更（ポート番号が1433じゃなかったらメモしておく)

    ※適用ボタンを押下すると再起動するまで云々言われるのでOKする
    上記設定が終わったら画面左のメニューの `SQL Serverのサービス`をクリック
    `SQL Server (MSSQLSERVER)`を右クリックして再起動を選択して再起動しておく


---
### 6. Mailhog設定
- MailHog_windows_amd64.exeをVMにダウンロード　 [ダウンロード](https://github.com/mailhog/MailHog/releases/v1.0.0)
- mailhog用のディレクトリ作成`C:\mailhog`, `C:\mailhog\mails`
- ダウンロードしたexeを`C:\mailhog`内に配置
- 以下を記載したバッチ（.bat）ファイルを作成(ファイル名は任意)しexeと同じディレクトリに配置
```bat
@echo off
cd /d C:\mailhog
start "" MailHog_windows_amd64.exe -storage=maildir -maildir-path=C:\mailhog\mails
```
- バッチファイルのショートカットをデスクトップに置いておくと便利
- シェルスクリプトはこちら
```
#!/bin/bash
./MailHog_windows_amd64.exe -storage=maildir -maildir-path=./mails
```

### 7. Laravel プロジェクトセットアップ
- Laravelプロジェクト内のpublicディレクトリに以下のweb.configを作成
`C:\inetpub\wwwroot\bookingapp\public\web.config
```xml
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="Laravel" stopProcessing="true">
                    <match url=".*" />
                    <conditions logicalGrouping="MatchAll">
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="index.php/{R:0}" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
```
- `storage/` と `bootstrap/cache` の書き込み権限を確認
	- エクスプローラーでプロパティ>セキュリティタブで「IIS_IUSERS」にフルコントロールを付与

- ホストの IP を確認
ホスト側で以下を実行します：

```bash
ipconfig
```
example
```
・
・
・
イーサネット アダプター イーサネット 2:
	接続固有の DNS サフィックス . . . . .:
	リンクローカル IPv6 アドレス. . . . .: fe80::ea2d:68b0:3af3:a74%63
	IPv4 アドレス . . . . . . . . . . . .: 192.168.56.1
	サブネット マスク . . . . . . . . . .:
	255.255.255.0 デフォルト ゲートウェイ . . . . . . .:
・
・
・
```

- PowerShell または CMD でプロジェクトディレクトリに移動
```powershell
cd C:\inetpub\wwwroot
cp .env.example .env
```

- `.env` の設定例
`ALLOWED_IPS`,`EXTERNAL_SYSTEM_BASE_URL`などはホストのIPに設定
```
APP_NAME=kuc_app
APP_URL=http://kyg.local
APP_TITLE="【ネットで予約】"

DB_CONNECTION=sqlsrv
DB_HOST=localhost
DB_PORT=1433
DB_DATABASE=kyg
DB_USERNAME=
DB_PASSWORD=
DB_LAST_KNOWN_CUSTOMER_NO=0

MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=test@email.com
MAIL_FROM_NAME="${APP_NAME}"

ALLOWED_IPS=192.168.56.1
EXTERNAL_SYSTEM_BASE_URL=http://192.168.56.1:3001
```

- Laravel 初期セットアップ
```cmd
composer install
npm install
php artisan key:generate
php artisan storage:link
php artisan migrate
php artisan db:seed
php artisan optimize
```
---
開発時
- mailhogを起動(6. Mailhog設定で作成したスクリプトのショートカットから)
- `npm run dev`
- ホストマシン上でモックAPI起動`node server.js`
- VM上のブラウザで`http://kyg.local`にアクセス