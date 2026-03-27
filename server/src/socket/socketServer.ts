// server/src/socket/socketServer.ts
import { createDecks } from "../state/createDecks";
import { Server } from "socket.io";

import {
  takeDifferentTokens,
  takeSameTokens,
  reserveCard,
  buyCard,
  checkNobles,
  endTurn,
  isGameEnded,
  getWinner
} from "../game/actions";

import { roomManager } from "../room/RoomManager";

function handleAction(
  io: any,
  socket: any,
  roomId: string,
  action: () => void
) {

  try {

    const gameState = roomManager.getGameState(roomId);

    action();

    const currentPlayer = gameState.currentPlayer;

    checkNobles(gameState, currentPlayer );

    endTurn(gameState, currentPlayer);

    if (isGameEnded(gameState)) {

      const winner = getWinner(gameState);

      // ★ winnerをgameStateに保存
      gameState.winnerId = winner.id;
      gameState.winnerName = winner.name;
      gameState.roundEndTriggered = true;

      io.to(roomId).emit("gameStateUpdate", gameState);

      return;

    }

    io.to(roomId).emit("gameStateUpdate", gameState);

  } catch (err: any) {

    socket.emit("actionError", {
      code: "INVALID_ACTION",
      message: err.message
    });

  }

}

export function createSocketServer(httpServer: any) {
  
  const io = new Server(httpServer, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", socket => {

    console.log("player connected", socket.id);

    // 再接続処理
    socket.on("reconnectPlayer", ({ roomId, playerId }) => {
      const room = roomManager.getRoom(roomId);

      if (!room) return;

      // 🔥 切断タイマーをキャンセル（リロード復帰対応）
      if (roomManager.clearDisconnectTimeout) {
        roomManager.clearDisconnectTimeout(playerId);
      }

      // socketId を更新
      const player = room.players.find(p => p.id === playerId);
      console.log(player)
      if (player) {
        player.socketId = socket.id;
      }

      socket.join(roomId);

      console.log("player reconnected", playerId, socket.id);

      // 現在のゲーム状態を再送
      try {
        const gameState = roomManager.getGameState(roomId);

        socket.emit("gameStateUpdate", gameState);
      } catch {
        // ゲームがまだ開始されていない場合
        socket.emit("roomUpdate", {
          players: room.players,
          hostId: room.hostId,
          status: room.status
        });
      }

    });

    // ルーム参加
    socket.on("joinRoom", ({ roomId, playerId, name }) => {

      // 🔥 再接続時の削除予約をキャンセル
      roomManager.clearDisconnectTimeout?.(playerId);

      let room = roomManager.getRoom(roomId);

      let isReconnect = false;

      if (!room) {
        room = roomManager.createRoom(roomId, playerId, socket.id, name);
      } else {
        // 🔥 既存プレイヤーか判定（reconnect）
        const existing = room.players.find(p => p.id === playerId);
        if (existing) {
          isReconnect = true;
        }

        roomManager.joinRoom(roomId, playerId, socket.id, name);
        room = roomManager.getRoom(roomId)!; // 最新状態を取得
      }

      socket.join(roomId);

      // 🔥 ゲーム状態に応じて適切なイベントを送信
      if (room.status === "playing") {
        try {
          const gameState = roomManager.getGameState(roomId);

          // reconnect時は個別に状態復元
          if (isReconnect) {
            socket.emit("gameStateUpdate", gameState);
          } else {
            io.to(roomId).emit("gameStateUpdate", gameState);
          }
        } catch {
          // fallback
          io.to(roomId).emit("roomUpdate", {
            players: room.players,
            hostId: room.hostId,
            status: room.status
          });
        }
      } else {
        io.to(roomId).emit("roomUpdate", {
          players: room.players,
          hostId: room.hostId,
          status: room.status
        });
      }

      console.log("join room", roomId, playerId);

    });

    // 🔥 状態再取得API（クライアントが任意タイミングで状態取得）
    socket.on("getGameState", ({ roomId }) => {
      try {
        const gameState = roomManager.getGameState(roomId);

        socket.emit("gameStateUpdate", gameState);
      } catch (err: any) {
        socket.emit("actionError", {
          code: "STATE_FETCH_ERROR",
          message: err.message
        });
      }
    });


    // ゲーム開始
    socket.on("startGame", ({ roomId }) => {    
      try {
        console.log("startGame called")
        console.log(roomId)
        
        const room = roomManager.getRoom(roomId);
        console.log(room)
        if (!room) throw new Error("ROOM_NOT_FOUND");
        
        console.log("② room OK");
        
        const playerCount = room.players.length;
        console.log("③ playerCount", playerCount);

        // 🔥 ここが今回の追加
        console.log("④ before createDecks");
        const { deck1, deck2, deck3, nobles } = createDecks(playerCount);
        console.log("⑤ after createDecks");

        console.log("⑥ before RoomManager.startGame");
        const gameState = roomManager.startGame(
          roomId,
          {
            level1: deck1,
            level2: deck2,
            level3: deck3,
          },
          nobles
        );
        console.log("⑦ after RoomManager.startGame");
        
        io.to(roomId).emit("gameStarted", gameState);
        io.to(roomId).emit("gameStateUpdate", gameState);
      } catch (err: any) {

        socket.emit("actionError", {
          code: "INVALID_ACTION",
          message: err.message
        });

      }

    });


    // トークン取得（統一）
    socket.on("takeTokens", payload => {

      handleAction(io, socket, payload.roomId, () => {

        const gameState = roomManager.getGameState(payload.roomId);

        if (payload.tokens.length === 2) {
          takeSameTokens(gameState, {
            playerId: payload.playerId,
            color: payload.tokens[0]
          });
        }

        if (payload.tokens.length === 3) {
          takeDifferentTokens(gameState, {
            playerId: payload.playerId,
            colors: payload.tokens
          });
        }

      });

    });


    // カード予約
    socket.on("reserveCard", payload => {

      handleAction(io, socket, payload.roomId, () => {

        const gameState = roomManager.getGameState(payload.roomId);

        reserveCard(gameState, {
          playerId: payload.playerId,
          cardId: payload.cardId
        });

      });

    });


    // カード購入
    socket.on("buyCard", payload => {

      handleAction(io, socket, payload.roomId, () => {

        const gameState = roomManager.getGameState(payload.roomId);

        buyCard(gameState, {
          playerId: payload.playerId,
          cardId: payload.cardId
        });

      });

    });

    // ゲームリセット（初期盤面に戻す）
    socket.on("resetGame", ({ roomId }) => {

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      // ゲーム状態をリセット（waitingに戻す）
      roomManager.resetGame?.(roomId);

      const updatedRoom = roomManager.getRoom(roomId);
      if (!updatedRoom) return;

      io.to(roomId).emit("roomUpdate", {
        players: updatedRoom.players,
        hostId: updatedRoom.hostId,
        status: updatedRoom.status
      });

      console.log("reset game", roomId);
    });

    // ルーム退出
    socket.on("leaveRoom", ({ roomId, playerId }) => {

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      // プレイヤー削除
      roomManager.leaveRoom(roomId, playerId);

      socket.leave(roomId);

      const updatedRoom = roomManager.getRoom(roomId);

      // ホストが退出した場合 → ルーム解散
      if (!updatedRoom || updatedRoom.players.length === 0) {
        roomManager.deleteRoom(roomId);
        io.to(roomId).emit("roomClosed");
        return;
      }

      if (updatedRoom.hostId === playerId) {
        roomManager.deleteRoom(roomId);
        io.to(roomId).emit("roomClosed");
        return;
      }

      // 残りプレイヤーに更新通知
      io.to(roomId).emit("roomUpdate", {
        players: updatedRoom.players,
        hostId: updatedRoom.hostId,
        status: updatedRoom.status
      });

      console.log("leave room", roomId, playerId);

    });

    socket.on("disconnect", () => {
      console.log("player disconnected", socket.id);

      const rooms = roomManager.getAllRooms();

      for (const room of rooms) {
        const player = room.players.find(p => p.socketId === socket.id);
        if (!player) continue;

        const roomId = room.id;
        const playerId = player.id;

        // 🔥 ホストが切断した場合：10秒待って復帰しなければ削除
        if (room.hostId === playerId) {
          console.log("⏳ host disconnected → wait for reconnect", playerId);

          const timeout = setTimeout(() => {
            console.log("❌ host timeout → delete room", playerId);

            roomManager.deleteRoom(roomId);
            io.to(roomId).emit("roomClosed");
          }, 10000);

          roomManager.setDisconnectTimeout(playerId, timeout);
          continue;
        }

        // ⏳ 一定時間後に削除（猶予）
        const timeout = setTimeout(() => {

          console.log("⏳ timeout leave", playerId);

          roomManager.leaveRoom(roomId, playerId);

          const updatedRoom = roomManager.getRoom(roomId);

          if (!updatedRoom || updatedRoom.players.length === 0) {
            roomManager.deleteRoom(roomId);
            io.to(roomId).emit("roomClosed");
            return;
          }

          if (updatedRoom.hostId === playerId) {
            roomManager.deleteRoom(roomId);
            io.to(roomId).emit("roomClosed");
            return;
          }

          io.to(roomId).emit("roomUpdate", {
            players: updatedRoom.players,
            hostId: updatedRoom.hostId,
            status: updatedRoom.status
          });

        }, 5000);

        // タイマー登録（reconnectでキャンセル用）
        roomManager.setDisconnectTimeout(playerId, timeout);
      }
    });

  });

}
