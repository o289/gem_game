type Props = {
  type?: "reconnect" | "initial"
}

export function LoadingScreen({ type = "initial" }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 text-white pointer-events-auto">
      <div className="flex flex-col items-center gap-4">
        <div className="text-xl font-bold">
          {type === "reconnect" ? "再接続中" : "ゲーム準備中"}
        </div>
        <div className="animate-pulse text-3xl">...</div>
      </div>
    </div>
  )
}