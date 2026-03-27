import { useState } from "react"
import { RoomPlayer } from "shared/types"

type Props = {
    roomId: string
    roomPlayers: RoomPlayer[]
    playerId: string
    hostId: string
    isHost: boolean
    startGame: () => void
    handleLeaveRoom: () => void
}

export default function({ roomId, roomPlayers, playerId, hostId, isHost, startGame, handleLeaveRoom }: Props){
    const [copied, setCopied] = useState(false)
    
    
    const handleCopyRoomId = async () => {
        try {
        await navigator.clipboard.writeText(roomId)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
        } catch (err) {
        console.error("copy failed", err)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-dvh w-full px-4 gap-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
            <div className="text-3xl font-bold tracking-wide bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            待機中...
            </div>

            <div
            className="w-full max-w-xs px-6 py-3 text-base rounded-xl bg-white/10 backdrop-blur border border-white/20 shadow-lg cursor-pointer hover:scale-105 transition-all"
            onClick={handleCopyRoomId}
            >
            <div className="text-sm text-gray-300">Room ID（タップでコピー）</div>
            <div className="text-xl font-semibold tracking-widest">{roomId}</div>
            {copied && <div className="text-xs text-green-400">コピーしました！</div>}
            </div>

            <div className="w-full max-w-xs px-6 py-4 text-base rounded-xl bg-white/10 backdrop-blur border border-white/20 shadow-lg flex flex-col gap-2">
            <div className="text-sm text-gray-300">プレイヤー</div>
            {roomPlayers.map((p) => (
                <div
                key={p.id}
                className="flex justify-between items-center px-2 py-1 rounded bg-white/5"
                >
                <span>{p.name}</span>
                {p.id === playerId && <span className="text-xs text-green-400">YOU</span>}
                {p.id === hostId && (
                    <span className="text-xs text-yellow-400">HOST</span>
                )}
                </div>
            ))}
            </div>

            {isHost && (
            <button
                className="w-full max-w-xs px-6 py-3 text-base rounded-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 hover:scale-105 transition-all shadow-lg"
                onClick={startGame}
            >
                ゲーム開始
            </button>
            )}

            <button
            className="w-full max-w-xs px-6 py-3 text-base rounded-lg font-semibold bg-gradient-to-r from-red-500 to-pink-600 hover:scale-105 transition-all shadow-lg"
            onClick={handleLeaveRoom}
            >
            ルーム退出
            </button>
        </div>
    )

    
}