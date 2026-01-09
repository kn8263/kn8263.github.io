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
### IIS(Webサーバー)の設定
