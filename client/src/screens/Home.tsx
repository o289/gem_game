import { useState } from "react"

type Props = {
  onCreateRoom: () => void
  onJoinRoom: (roomId: string) => void
  name: string
  setName: (name: string) => void
}

export default function Home({ onCreateRoom, onJoinRoom, name, setName }: Props) {
  const [joinId, setJoinId] = useState("")
  const isNameValid = name && name.trim().length > 0

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 gap-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
      
      <h1 className="text-4xl font-extrabold tracking-wide bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
        Gem Game
      </h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="名前を入力"
        className="w-full max-w-xs px-4 py-3 text-base rounded bg-white/10 backdrop-blur border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />

      {/* ルーム作成 */}
      <button
        className={`w-full max-w-xs px-6 py-3 text-base rounded-lg font-semibold transition-all ${isNameValid ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:scale-105 shadow-lg' : 'bg-gray-500 cursor-not-allowed'}`}
        onClick={onCreateRoom}
        disabled={!isNameValid}
      >
        ルームを作成
      </button>

      {/* ルーム参加 */}
      <div className="flex flex-col gap-3 items-center w-full">
        <input
          className="w-full max-w-xs px-4 py-3 text-base rounded bg-white/10 backdrop-blur border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="ルームIDを入力"
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
        />

        <button
          className={`w-full max-w-xs px-6 py-3 text-base rounded-lg font-semibold transition-all ${isNameValid ? 'bg-gradient-to-r from-blue-400 to-cyan-500 hover:scale-105 shadow-lg' : 'bg-gray-500 cursor-not-allowed'}`}
          onClick={() => onJoinRoom(joinId)}
          disabled={!isNameValid}
        >
          ルームに参加
        </button>
      </div>

    </div>
  )
}