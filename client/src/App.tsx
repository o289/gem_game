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

  const { config } = useGameConfig()
  

  useEffect(() => {
    socketClient.onGameStarted((state) => {
      setGameState(state)
      setRoomStatus("playing")
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
    const savedStatus = sessionStorage.getItem("roomStatus") as RoomStatus
    const savedIsHost = sessionStorage.getItem("isHost") === "true"

    if (savedRoomId && savedPlayerId) {
      console.log("🔄 reconnect", savedRoomId, savedPlayerId)

      setRoomId(savedRoomId)
      setPlayerId(savedPlayerId)
      setIsHost(savedIsHost)

      socketClient.reconnectPlayer(savedRoomId, savedPlayerId)
      if (savedStatus) {
        setRoomStatus(savedStatus)
      }
    }
  }, [])

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
      <WaitingScreen
        roomId={roomId}
        roomPlayers={roomPlayers}
        playerId={playerId}
        hostId={hostId}
        isHost={isHost}
        startGame={startGame}
        handleLeaveRoom={handleLeaveRoom}
      />
    )
  }

  if (roomStatus === "playing") {
    return (
      <DragProvider>
        <GameProvider gameState={gameState} setGameState={setGameState} myPlayerId={playerId} roomId={roomId}>
          <TokenProvider>
            <GameScreen roomId={roomId}/>
          </TokenProvider>
        </GameProvider>
      </DragProvider>
    )
  }

  return null
}