// root/tests/testClient.ts
// Automatic multi-player test bot

import { io } from "socket.io-client";

const SERVER = "http://localhost:3000";
const ROOM_ID = "room1";

// number of bots (2–4 recommended)
const BOT_COUNT = 2;

const COLORS = ["emerald", "diamond", "ruby", "onyx", "sapphire"];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function randomThreeColors() {
  const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

function createBot(playerId: string, isHost: boolean) {

  const socket = io(SERVER);

  let gameState: any = null;
  let lastAction: string | null = null;
  let turnCount = 0;

  function canBuy(card: any) {
    let needGold = 0;

    for (const c of COLORS) {
      const cost = card.cost[c] || 0;
      const bonus = gameState.players.find((p: any) => p.id === playerId).bonuses?.[c] || 0;
      const tokens = gameState.players.find((p: any) => p.id === playerId).tokens?.[c] || 0;

      const remain = Math.max(0, cost - bonus);

      if (tokens >= remain) continue;

      needGold += remain - tokens;
    }

    return needGold <= (gameState.players.find((p: any) => p.id === playerId).tokens?.gold || 0);
  }

  function tryBuy() {
    for (const level of ["level1", "level2", "level3"]) {
      for (const card of gameState.market[level] || []) {
        if (canBuy(card)) {
          console.log(playerId, "buyCard", card.id);
          lastAction = "buy";
          socket.emit("buyCard", {
            roomId: ROOM_ID,
            playerId,
            cardId: card.id,
            source: "market"
          });
          return true;
        }
      }
    }

    const me = gameState.players.find((p: any) => p.id === playerId);

    for (const card of me.reservedCards || []) {
      if (canBuy(card)) {
        console.log(playerId, "buyReservedCard", card.id);
        lastAction = "buy";
        socket.emit("buyCard", {
          roomId: ROOM_ID,
          playerId,
          cardId: card.id,
          source: "reserved"
        });
        return true;
      }
    }

    return false;
  }

  function tryReserve() {
    const me = gameState.players.find((p: any) => p.id === playerId);
    if ((me.reservedCards || []).length >= 3) return false;

    const level = ["level1", "level2", "level3"][Math.floor(Math.random() * 3)];
    const cards = gameState.market[level];
    if (!cards || cards.length === 0) return false;

    const card = cards[Math.floor(Math.random() * cards.length)];

    console.log(playerId, "reserveCard", card.id);
    lastAction = "reserve";
    socket.emit("reserveCard", {
      roomId: ROOM_ID,
      playerId,
      cardId: card.id,
      source: "market"
    });

    return true;
  }

  function takeTokens() {
    if (Math.random() < 0.5) {
      const colors = randomThreeColors();
      console.log(playerId, "takeDifferentTokens", colors);
      lastAction = "takeDifferent";
      socket.emit("takeDifferentTokens", {
        roomId: ROOM_ID,
        playerId,
        colors
      });
    } else {
      const color = randomColor();
      console.log(playerId, "takeSameTokens", color);
      lastAction = "takeSame";
      socket.emit("takeSameTokens", {
        roomId: ROOM_ID,
        playerId,
        color
      });
    }
  }

  socket.on("connect", () => {

    console.log("Bot connected", playerId, socket.id);

    socket.emit("joinRoom", {
      roomId: ROOM_ID,
      playerId
    });

    // host starts game
    if (isHost) {

      setTimeout(() => {

        console.log("Host starting game");

        socket.emit("startGame", {
          roomId: ROOM_ID
        });

      }, 1000);

    }

  });

  socket.on("gameStarted", (state) => {

    console.log("Game started", playerId);

    gameState = state;

  });

  socket.on("gameStateUpdate", (state) => {

    gameState = state;

    // turn counter (prevent infinite loop)
    turnCount++;
    if (turnCount > 200) {
      console.log("Force end (too many turns)", playerId);
      process.exit();
    }

    // simple turn log
    console.log("TURN", state.turn, "CURRENT", state.currentPlayer);

    if (state.currentPlayer === playerId) {
      performFuzzAction();
    }

  });

  socket.on("gameEnded", (payload) => {

    console.log("Game ended", payload);

    if (gameState?.players) {
      console.log("Final point:");
      for (const p of gameState.players) {
        console.log(p.id, "point:", p.point);
      }
    }

    process.exit();

  });

  socket.on("actionError", (err) => {

    console.log("Bot action error", playerId, err.message);

    setTimeout(() => {
      if (!gameState || gameState.currentPlayer !== playerId) return;

      // try a different action than last time
      if (lastAction !== "buy" && tryBuy()) return;

      if (lastAction !== "reserve" && Math.random() < 0.5 && tryReserve()) return;

      if (lastAction !== "takeDifferent") {
        const colors = randomThreeColors();
        console.log(playerId, "retry takeDifferentTokens", colors);
        lastAction = "takeDifferent";
        socket.emit("takeDifferentTokens", {
          roomId: ROOM_ID,
          playerId,
          colors
        });
        return;
      }

      const color = randomColor();
      console.log(playerId, "retry takeSameTokens", color);
      lastAction = "takeSame";
      socket.emit("takeSameTokens", {
        roomId: ROOM_ID,
        playerId,
        color
      });

    }, 200);

  });

  function performFuzzAction() {

    if (!gameState) return;

    const me = gameState.players.find((p: any) => p.id === playerId);
    if (!me) return;

    const market = gameState.market;

    setTimeout(() => {

      // priority: buy > reserve > tokens
      if (tryBuy()) return;

      if (Math.random() < 0.4 && tryReserve()) return;

      takeTokens();

    }, 300);

  }

}

// spawn bots
for (let i = 0; i < BOT_COUNT; i++) {

  const playerId = `bot_${i + 1}`;

  createBot(playerId, i === 0);

}
