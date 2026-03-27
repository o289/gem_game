import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { roomManager } from "../room/RoomManager";
import { createDecks } from "../state/createDecks";

const router = Router();

function generateRoomId(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

// =========================
// ① ルーム作成
// =========================
router.post("/create", (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      throw new Error("NAME_REQUIRED");
    }

    const roomId = generateRoomId();
    const playerId = "p-" + uuidv4().slice(0, 6);

    const socketId = "temp-socket"; // 今は仮

    const room = roomManager.createRoom(roomId, playerId, socketId, name);

    res.json({
      roomId: room.id,
      playerId,
      players: room.players,
      status: room.status,
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});


// =========================
// ② ルーム参加
// =========================
router.post("/join", (req, res) => {
  try {
    const { roomId, name } = req.body;
    if (!name) {
      throw new Error("NAME_REQUIRED");
    }

    const playerId = "p-" + uuidv4().slice(0, 6);
    const socketId = "temp-socket";

    const room = roomManager.joinRoom(roomId, playerId, socketId, name);

    res.json({
      roomId: room.id,
      playerId,
      players: room.players,
      status: room.status,
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});


// =========================
// ③ ルーム情報取得
// =========================
router.get("/:roomId", (req, res) => {
  try {
    const { roomId } = req.params;

    const room = roomManager.getRoom(roomId);

    if (!room) {
      throw new Error("ROOM_NOT_FOUND");
    }

    res.json({
      id: room.id,
      players: room.players,
      status: room.status,
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});


// =========================
// ④ ゲーム開始
// =========================
router.post("/:roomId/start", (req, res) => {
  try {
    const { roomId } = req.params;

    const players = roomManager.getPlayers(roomId);

    // デッキ生成
    const { deck1, deck2, deck3, nobles } = createDecks(players.length);

    const gameState = roomManager.startGame(roomId, {
      level1: deck1,
      level2: deck2,
      level3: deck3,
    }, nobles);

    res.json(gameState);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});


// =========================
// ⑤ ゲーム状態取得
// =========================
router.get("/:roomId/game", (req, res) => {
  try {
    const { roomId } = req.params;

    const gameState = roomManager.getGameState(roomId);

    res.json(gameState);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});


export default router;