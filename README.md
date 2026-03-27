# gem_game
Socket.IO を使用したリアルタイム対戦ゲーム

## 技術スタック

- 言語: TypeScript
- フレームワーク: React, Node.js, Express.js, tailwindcss
- socket: Socket.IO
- トンネルサービス: ngrok

今回は言語をサーバー、クライアントで統一する
また、開発者のPCがスリープ時は遊べなくする予定なのでトンネルサービスはngrokを採用

## 起動方法

### server
cd server
npm install
npm run dev

### client
cd client
npm install
npm run dev

