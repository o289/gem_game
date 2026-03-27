// 🔥 必ず一番上（他のimportより前）
import "dotenv/config"

import express from "express";
import http from "http";
import cors from "cors";
import path from "path";

import { createSocketServer } from "./socket/socketServer";
import gameRoutes from "./routes/game";
import roomRouter from "./routes/room";

const PUBLIC_URL = process.env.PUBLIC_URL;

console.log("PUBLIC_URL:", PUBLIC_URL);


console.log("① start")
const app = express();
console.log("② express")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ミドルウェア
app.use(cors());
app.use(express.json());
// 🔥 clientのビルドファイルを配信
app.use(express.static(path.resolve(__dirname, "../../client/dist")));

// API
app.use("/room", roomRouter);
app.use("/room", gameRoutes);
// 🔥 SPA対応（どのパスでもindex.htmlを返す）
app.use((req, res) => {
  res.sendFile(
    path.resolve(__dirname, "../../client/dist/index.html")
  )
})

// HTTP + Socket
const server = http.createServer(app);
console.log("③ http")
createSocketServer(server);
console.log("④ socket")

// 起動
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`listen. Game server running on port ${PORT}`);
  console.log(`Public URL: ${PUBLIC_URL}`);
});

