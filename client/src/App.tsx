import { useState, useEffect } from "react"

import  Home from './screens/Home'
import WaitingScreen from "./screens/WaitingScreen"
import { GameScreen } from './screens/GameScreen'

import { GameProvider } from './context/GameContext'
import { DragProvider } from './context/DragContext'
import { TokenProvider } from './context/TokenContext'
import { GameState, RoomPlayer } from "shared/types"
import { api } from "./api/apiClient"
import { socketClient } from "./socket/socketClient"

import { useGameConfig } from "./context/GameConfigContext"
import { isRoomError } from "shared/errors/errorCodes"
import { Modal } from "./components/ui/Modal"
import { LoadingScreen } from "./screens/LoadingScreen"
import { useAssets } from "./hooks/useAssets"


type RoomStatus = "waiting" | "playing" | null

export default function App() {
  const [roomStatus, setRoomStatus] = useState<RoomStatus>(null)

  const [gameState, setGameState] = useState<GameState | null>(null)
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>([])
  const [hostId, setHostId] = useState<string>("")

  const [roomId, setRoomId] = useState("")
  const [playerId, setPlayerId] = useState("")
  const [name, setName] = useState("")
  const [isHost, setIsHost] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  const [error, setError] = useState<string | null>(null)
    
  const { config } = useGameConfig()
  const assetLoaded = useAssets()

  const me = gameState?.players?.find(p => p.id === playerId);
  
  const isReady =
  !!gameState &&
  Array.isArray(gameState.players) &&
  gameState.players.length > 0 &&
  !!me &&
  assetLoaded;

  useEffect(() => {
    socketClient.onGameStarted((state) => {
      setGameState(state)
      setRoomStatus("playing")
      setIsStarting(false)
    })

    return () => {
      socketClient.offGameStarted()
    }
  }, [])

  useEffect(() => {
    socketClient.onRoomUpdate((data) => {
      setRoomPlayers(data.players)
      setHostId(data.hostId)
      setRoomStatus(data.status ?? null)
    })

    return () => {
      socketClient.offRoomUpdate()
    }
  }, [])

  useEffect(() => {
    const savedRoomId = sessionStorage.getItem("roomId")
    const savedPlayerId = sessionStorage.getItem("playerId")
    const savedName = sessionStorage.getItem("name")
    const savedIsHost = sessionStorage.getItem("isHost") === "true"

    if (savedRoomId && savedPlayerId && savedName) {
      console.log("🔄 reconnect", savedRoomId, savedPlayerId)

      setName(savedName)
      setRoomId(savedRoomId)
      setPlayerId(savedPlayerId)
      setIsHost(savedIsHost)

      socketClient.joinRoom(savedRoomId, savedPlayerId, savedName)
    }
  }, [])

  // ゲーム状態を元に戻す（playerId確定後にのみ適用）
  useEffect(() => {
    const handler = (state: GameState) => {

      // 🔥 playerId未確定のときは無視
      if (!playerId) return;

      setGameState(state)
    }

    socketClient.onGameStateUpdate(handler)

    return () => {
      socketClient.offGameStateUpdate()
    }
  }, [playerId])

  // エラー
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const handler = (payload: { code: string; message: string }) => {
      if (!isRoomError(payload.code)) return;

      setError(payload.message);

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        socketClient.leaveRoom(roomId);

        // セッションリセット
        sessionStorage.removeItem("roomId");
        sessionStorage.removeItem("playerId");
        sessionStorage.removeItem("isHost");
        sessionStorage.removeItem("roomStatus");

        setRoomId("");
        setPlayerId("");
        setIsHost(false);
        setRoomStatus(null);

        setError(null);
      }, 2000);
    };

    socketClient.onForceExitRoom(handler);

    return () => {
      socketClient.offForceExitRoom(handler);
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [roomId]);

  // ルーム作成
  const handleCreateRoom = async () => {
    const res = await api.post("/room/create", {
      name
    })
    const data = await res

    setRoomId(data.roomId)
    setPlayerId(data.playerId)
    setIsHost(true)

    sessionStorage.setItem("roomId", data.roomId)
    sessionStorage.setItem("playerId", data.playerId)
    sessionStorage.setItem("isHost", "true")
    sessionStorage.setItem("roomStatus", "waiting")
    sessionStorage.setItem("name", name)

    socketClient.joinRoom(data.roomId, data.playerId, name)

    setRoomStatus("waiting")
  }

  // ルーム参加
  const handleJoinRoom = async (roomId: string) => {
    const res = await api.post("/room/join", {
      roomId,
      name
    })

    const data = await res

    setRoomId(data.roomId)
    setPlayerId(data.playerId)
    setIsHost(false)

    sessionStorage.setItem("roomId", data.roomId)
    sessionStorage.setItem("playerId", data.playerId)
    sessionStorage.setItem("isHost", "false")
    sessionStorage.setItem("roomStatus", "waiting")
    sessionStorage.setItem("name", name)

    socketClient.joinRoom(data.roomId, data.playerId, name)

    setRoomStatus("waiting")
  }

  // ルーム退出
  const handleLeaveRoom = () => {
    socketClient.leaveRoom(roomId)

    sessionStorage.removeItem("roomId")
    sessionStorage.removeItem("playerId")
    sessionStorage.removeItem("isHost")
    sessionStorage.removeItem("roomStatus")

    setRoomId("")
    setPlayerId("")
    setIsHost(false)
    setRoomStatus(null)
  }

  // ゲーム開始
  const startGame = () => {
    try {
      setIsStarting(true)
      socketClient.startGame(roomId, config)
    } catch (err) {
      console.error("startGame error:", err)
    }
  }

  if (!roomId) {
    return (
      <Home
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        name={name}
        setName={setName}
      />
    )
  }


  if (roomStatus === "waiting") {
    return (
      <>
        {isStarting && <LoadingScreen type="initial" />}

        <WaitingScreen
          roomId={roomId}
          roomPlayers={roomPlayers}
          playerId={playerId}
          hostId={hostId}
          isHost={isHost}
          startGame={startGame}
          handleLeaveRoom={handleLeaveRoom}
        />
      </>
    )
  }

  if (roomStatus === "playing") {
    return (
      <>
        {!isReady && (
          <LoadingScreen type="reconnect" />
        )}

        <DragProvider>
          <GameProvider gameState={gameState} setGameState={setGameState} myPlayerId={playerId} roomId={roomId}>
            <TokenProvider>
              <GameScreen roomId={roomId}/>
            </TokenProvider>
          </GameProvider>
        </DragProvider>
      </>
    )
  }
  
  <Modal isOpen={!!error}>
    <div className="flex flex-col items-center gap-4">
      <div className="text-red-400 text-lg font-bold">
        エラー
      </div>
      <div className="text-center">
        {error}
      </div>
      <div className="text-center">
        2秒後にホームに戻ります
      </div>
    </div>
  </Modal>

  return null
}