# カードドラゴン

## ゲーム概要
カードドラゴンは、カードを使って進むシンプルなRPGゲームです。プレイヤーはカードを選んで進み、モンスターと戦いながらゴールを目指します。

## ゲームの遊び方
1. スタート地点からゴール（50マス目）を目指します
2. 手札のカードを選んで進みます
3. マスの色によって異なるイベントが発生します
4. モンスターと戦って経験値を獲得し、レベルアップを目指します
5. HPが0になるとゲームオーバー、ゴールに到達するとゲームクリアです

## マスの種類とイベント
### 赤マス（危険なマス）
- モンスター出現 (90%): 強制的に戦闘が始まります
- 落とし穴 (5%): 2-4のダメージを受けます
- 回り道 (5%): 1-3マス後ろに戻されます

### 青マス（幸運なマス）
- カード1枚獲得 (60%): 新しいカードを1枚入手
- カード2枚獲得 (30%): 新しいカードを2枚入手
- 宿屋 (5%): 4-7のHPを回復
- 馬車 (5%): 2-4マス進みます

### 通常マス
- 何も起きない (50%)
- モンスター出現 (15%)
- カード1枚獲得 (10%)
- カード2枚獲得 (5%)
- 宿屋 (5%): 3-6のHP回復
- 馬車 (5%): 2-4マス進む
- 落とし穴 (5%): 2-4のダメージ
- 回り道 (5%): 1-3マス戻る

## カードの種類
- 移動カード (1-6): 指定された数だけマスを進みます
- 回復カード (H): HPを回復します
- 強回復カード (H+): HPを大きく回復します
- 武器カード: 攻撃力が上昇します（4段階の強さがあります）

## レベルアップシステム
- モンスターを倒すと経験値を獲得
- レベルアップすると最大HPと攻撃力が上昇
- より強いモンスターを倒すとより多くの経験値を獲得

## 操作方法
- カードをクリックして進む
- 戦闘中は「攻撃」ボタンをクリック
- ゲームオーバー/クリア時は「もう一度遊ぶ」ボタンで再開

## 開発環境
- React + TypeScript
- Vite
- CSS Modules

## インストール方法
1. リポジトリをクローン
```bash
git clone https://github.com/your-repo/carddragon.git
```
2. 依存パッケージをインストール
```bash
npm install
```
3. 開発サーバーを起動
```bash
npm run dev
```

## デプロイ方法
```bash
npm run build
npm run deploy
```

## ライセンス
MIT License
