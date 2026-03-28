import { spawn } from "child_process"
import http from "http"
import fs from "fs"

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
}

const processes = []

function run(cmd, args, label, options = {}) {
  let color = COLORS.reset
  if (label === "ngrok") color = COLORS.green

  const p = spawn(cmd, args, {
    stdio: ["inherit", "pipe", "pipe"],
    shell: true,
    detached: true,
    ...options,
  })

  // ログにプレフィックスを付ける
  p.stdout.on("data", d => {
    process.stdout.write(`${color}[${label}] ${d}${COLORS.reset}`)
  })

  p.stderr.on("data", d => {
    process.stderr.write(`${color}[${label} ERROR] ${d}${COLORS.reset}`)
  })

  processes.push(p)
  return p
}

function cleanup() {
  console.log("\n終了処理中...")

  processes.forEach(p => {
    try {
      // プロセスグループごと終了
      process.kill(-p.pid, "SIGINT")
    } catch {}
  })

  process.exit()
}

process.on("SIGINT", cleanup)
process.on("SIGTERM", cleanup)

function wait(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function getNgrokUrl() {
  return new Promise((resolve, reject) => {
    http.get("http://127.0.0.1:4040/api/tunnels", res => {
      let data = ""

      res.on("data", chunk => data += chunk)
      res.on("end", () => {
        const json = JSON.parse(data)
        const tunnel = json.tunnels.find(t => t.proto === "https")

        if (!tunnel) return reject("no tunnel")

        resolve(tunnel.public_url)
      })
    }).on("error", reject)
  })
}

// 🔥 追加：envを安全に更新する関数
function updateEnvFile(path, key, value) {
  let content = ""

  if (fs.existsSync(path)) {
    content = fs.readFileSync(path, "utf-8")
  }

  // 既存のキー削除
  const regex = new RegExp(`${key}=.*`, "g")
  content = content.replace(regex, "")

  // 末尾に追加
  content += `\n${key}=${value}\n`

  fs.writeFileSync(path, content)
}

async function main() {
  // ① client build（毎回実行）
  console.log("client build 実行中...")
  await new Promise((resolve, reject) => {
    const p = spawn("npm", ["run", "build"], {
      cwd: "./client",
      stdio: "inherit",
    })
    p.on("close", code => {
      if (code === 0) resolve()
      else reject(new Error("client build 失敗"))
    })
  })
  console.log("client build 完了")

  // ② ngrok起動
  const ngrok = run("ngrok", ["http", "3000"], "ngrok")

  console.log("ngrok起動中...")

  let url

  // ② URL待ち
  for (let i = 0; i < 15; i++) {
    try {
      await wait(1000)
      url = await getNgrokUrl()
      break
    } catch {}
  }

  if (!url) {
    console.error("ngrok URL取得失敗")
    process.exit(1)
  }

  console.log("URL:", url)

  // ③ client: .env.local 更新
  updateEnvFile(
    "./client/.env.local",
    "VITE_SERVER_URL",
    url
  )

  console.log("client .env.local 更新完了")

  // ④ server: .env 更新（公開URL同期）
  updateEnvFile(
    "./server/.env",
    "PUBLIC_URL",
    url
  )

  console.log("server .env 更新完了")

  // ⑤ server起動
  run("npm", ["run", "dev"], "server", {
    cwd: "./server",
  })

  // 少し待つ（server先に起動させる）
  await wait(1000)

  // ⑥ client起動
  run("npm", ["run", "dev"], "client", {
    cwd: "./client",
  })
}

main()