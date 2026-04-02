// server/src/socket/socketServer.ts
import { createDecks } from "../state/createDecks";
import { Server } from "socket.io";

import {
  takeDifferentTokens,
  takeSameTokens,
  reserveCard,
  reserveFromDeck,
  buyCard,
  checkNobles,
  endTurn,
  isGameEnded,
  getWinner
} from "../game/actions";

import { roomManager } from "../room/RoomManager";

import { GameError, RoomError } from "shared/errors/Error";

function handleError(socket: any, err: any) {
  if (err instanceof GameError || err instanceof RoomError) {
    socket.emit("actionError", {
      code: err.code,
      message: err.message
    });
    return;
  }

  console.error(err);

  socket.emit("actionError", {
    code: "UNKNOWN_ERROR",
    message: "予期しないエラーが発生しました"
  });
}

function validateContext(roomId: string, playerId?: string) {
  const room = roomManager.getRoom(roomId);
  if (!room) {
    throw new RoomError("ROOM_NOT_FOUND", "ルームが存在しません");
  }

  let player;

  if (playerId) {
    player = room.players.find((p: any) => p.id === playerId);
    if (!player) {
      throw new RoomError("PLAYER_NOT_FOUND", "プレイヤーが存在しません");
    }
  }

  return { room, player };
}

function handleAction(
  io: any,
  socket: any,
  roomId: string,
  action: () => void
) {

  try {
    const { room } = validateContext(roomId);
    const config = room.config;

    const gameState = roomManager.getGameState(roomId);

    action();

    const currentPlayer = gameState.currentPlayer;

    checkNobles(gameState, currentPlayer );

    endTurn(gameState, currentPlayer, config);

    if (isGameEnded(gameState, config)) {

      const winner = getWinner(gameState, config);

      if (!winner){
        io.to(roomId).emit("gameStateUpdate", gameState);
        return;
      }

      // ★ winnerをgameStateに保存
      gameState.winnerId = winner.id;
      gameState.winnerName = winner.name;
      gameState.roundEndTriggered = true;

      io.to(roomId).emit("gameStateUpdate", gameState);

      return;

    }

    io.to(roomId).emit("gameStateUpdate", gameState);

  } catch (err: any) {
    if (err instanceof RoomError) {
      // ルーム崩壊 → 全員強制退出
      roomManager.deleteRoom(roomId);
      io.to(roomId).emit("forceExitRoom", {
        code: err.code,
        message: err.message
      });
      return;
    }

    handleError(socket, err);
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

    // 🔥 接続時に復帰処理（authベース）
    const { roomId: authRoomId, playerId: authPlayerId } = socket.handshake.auth || {};

    if (authRoomId && authPlayerId) {
      const room = roomManager.getRoom(authRoomId);
      const player = room?.players.find((p: any) => p.id === authPlayerId);

      if (room && player) {
        // socketId更新 & 再接続復帰
        player.socketId = socket.id;
        player.isDisconnected = false;

        // 🔥 socketにplayer情報を保持
        socket.data.playerId = authPlayerId;
        socket.data.roomId = authRoomId;

        console.log(player.socketId === socket.id)
        console.log(player.isDisconnected)
        console.log(socket.data.playerId)
        console.log(socket.data.roomId)

        // タイムアウトキャンセル
        roomManager.clearDisconnectTimeout?.(authRoomId, authPlayerId);

        socket.join(authRoomId);

        console.log("✅ reconnect success", authPlayerId);

        // 状態同期（軽量に1回送る）
        if (room.status === "playing") {
          try {
            const gameState = roomManager.getGameState(authRoomId);
            socket.emit("gameStateUpdate", gameState);
          } catch {}
        } else {
          socket.emit("roomUpdate", {
            players: room.players,
            hostId: room.hostId,
            status: room.status
          });
        }
      }
    }

    // ルーム参加
    socket.on("joinRoom", ({ roomId, playerId, name }) => {

      // 🔥 再接続時の削除予約をキャンセル
      roomManager.clearDisconnectTimeout?.(roomId, playerId);

      let room = roomManager.getRoom(roomId);

      let isReconnect = false;

      if (!room) {
        room = roomManager.createRoom(roomId, playerId, socket.id, name);
      } else {
        const wasExisting = room.players.some(p => p.id === playerId);

        roomManager.joinRoom(roomId, playerId, socket.id, name);

        isReconnect = wasExisting;

        if (room.status === "playing") {
          roomManager.assertPlayerInGame(roomId, playerId);
        }

        room = roomManager.getRoom(roomId)!;
      }

      socket.join(roomId);

      // 🔥 ゲーム状態に応じて適切なイベントを送信
      if (room.status === "playing") {
        const trySendGameState = () => {
          try {
            const gameState = roomManager.getGameState(roomId);

            if (isReconnect) {
              socket.emit("gameStateUpdate", gameState);
            } else {
              io.to(roomId).emit("gameStateUpdate", gameState);
            }
          } catch (err) {
            // 🔥 非同期順序ズレ対策：少し待って再試行
            setTimeout(trySendGameState, 100);
          }
        };

        trySendGameState();

        // 🔥 playing中でもroom情報を同期
        socket.emit("roomUpdate", {
          players: room.players,
          hostId: room.hostId,
          status: room.status
        });

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
        handleError(socket, err);
      }
    });


    // ゲーム開始
    socket.on("startGame", ({ roomId, config }) => {    
      try {
        console.log("startGame called")
        console.log(roomId)
        
        const room = roomManager.getRoom(roomId);
        console.log(room)
        if (!room) throw new RoomError("ROOM_NOT_FOUND", "ルームが存在しません");
        
        console.log("② room OK");
        
        const playerCount = room.players.length;
        console.log("③ playerCount", playerCount);

        // 🔥 ここが今回の追加
        console.log("④ before createDecks");
        const { deck1, deck2, deck3, nobles } = createDecks(playerCount, room.config);
        console.log("⑤ after createDecks");

        console.log("⑥ before RoomManager.startGame");
        const gameState = roomManager.startGame(
          roomId,
          config,
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

        // 🔥 ゲーム開始時にroom情報も同期
        const updatedRoom = roomManager.getRoom(roomId);
        if (updatedRoom) {
          io.to(roomId).emit("roomUpdate", {
            players: updatedRoom.players,
            hostId: updatedRoom.hostId,
            status: updatedRoom.status
          });
        }
      } catch (err: any) {
        handleError(socket, err);
      }

    });


    // トークン取得（統一）
    socket.on("takeTokens", payload => {

      handleAction(io, socket, payload.roomId,() => {

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

      handleAction(io, socket, payload.roomId,() => {

        const gameState = roomManager.getGameState(payload.roomId);

        switch (payload.type) {
          case "market":
            reserveCard(gameState, {
              playerId: payload.playerId,
              cardId: payload.cardId
            });
            break;

          case "deck":
            reserveFromDeck(gameState, {
              playerId: payload.playerId,
              level: payload.level
            })
            break;
        }
        
      });

    });


    // カード購入
    socket.on("buyCard", payload => {

      handleAction(io, socket, payload.roomId,() => {

        const gameState = roomManager.getGameState(payload.roomId);

        buyCard(gameState, {
          playerId: payload.playerId,
          cardId: payload.cardId,
          payment: payload.payment
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

    // 一時切断
    socket.on("disconnect", () => {
      console.log("player disconnected", socket.id);

      const rooms = roomManager.getAllRooms();

      for (const room of rooms) {
        const playerId = socket.data.playerId;
        const roomId = socket.data.roomId;

        if (!playerId || !roomId) continue;

        const player = room?.players.find(p => p.id === playerId);
        if (!player) continue;

        // 🔥 追加（これが最重要）
        if (player.socketId !== socket.id) {
          return;
        }

        // 🔥 一時切断フラグ
        player.isDisconnected = true;
        console.log(player.isDisconnected)

        // 🔥 ホストが切断した場合：10秒待って復帰しなければ削除
        if (room.hostId === playerId) {
          console.log("⏳ host disconnected → wait for reconnect", playerId);

          const timeout = setTimeout(() => {
            const roomNow = roomManager.getRoom(roomId);

            // 🔥 ルームがもう存在しない → 無視
            if (!roomNow) {
              return;
            }
            
            const playerNow = roomNow?.players.find(p => p.id === playerId);

            // 🔥 復帰済みなら何もしない
            if (!playerNow || !playerNow.isDisconnected) {
              return;
            }

            console.log("❌ host timeout → delete room", playerId);

            roomManager.deleteRoom(roomId);
            io.to(roomId).emit("roomClosed");
          }, 10000);

          roomManager.setDisconnectTimeout(roomId, playerId, timeout);
          continue;
        }

        // ⏳ 一定時間後に削除（猶予）
        const timeout = setTimeout(() => {

          const roomNow = roomManager.getRoom(roomId);
          const playerNow = roomNow?.players.find(p => p.id === playerId);

          // 🔥 復帰済みなら何もしない
          if (!playerNow || !playerNow.isDisconnected) {
            return;
          }

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
        roomManager.setDisconnectTimeout(roomId, playerId, timeout);
      }
    });

  });

}
