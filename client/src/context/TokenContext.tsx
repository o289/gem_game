import { createContext, useContext, useState, ReactNode } from "react";
import { TokenColor } from "shared/types"; // あなたの型に合わせて調整
import { useGameContext } from "./GameContext";
import { playSound } from "../util/sound";


type TokenContextType = {
  selectedTokens: TokenColor[];
  addToken: (token: TokenColor) => void;
  resetTokens: () => void;
  canSelectToken: (token: TokenColor) => boolean;
};

const TokenContext = createContext<TokenContextType | null>(null);

export const TokenProvider = ({ children }: { children: ReactNode }) => {
  const { setActionState } = useGameContext()
  const [selectedTokens, setSelectedTokens] = useState<TokenColor[]>([]);

  // トークン追加
  const addToken = (token: TokenColor) => {
    setSelectedTokens(prev => [...prev, token]);
    playSound('token')
    const next = [...selectedTokens, token]

    if (
      next.length === 3 ||
      (next.length === 2 && next[0] === next[1])
    ) {
      setActionState({ type: 'token_selecting' })
    }

  };

  // リセット
  const resetTokens = () => {
    setSelectedTokens([]);
  };

  // 選択可能か判定（Splendorルールに従う）
  const canSelectToken = (token: TokenColor) => {
    // goldは選択不可（予約専用）
    if (token === "gold") return false;

    const count = selectedTokens.length;

    // 0枚 → 何でもOK
    if (count === 0) return true;

    // 1枚 → 同色でも異色でもOK
    if (count === 1) return true;

    // 2枚
    if (count === 2) {
      const [a, b] = selectedTokens;

      // 同色2枚 → もう選べない
      if (a === b) return false;

      // 異色2枚
      // 同じ色はNG
      if (selectedTokens.includes(token)) return false;

      return true;
    }

    // 3枚以上 → 取れない
    return false;
  };

  return (
    <TokenContext.Provider
      value={{
        selectedTokens,
        addToken,
        resetTokens,
        canSelectToken,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export const useTokenContext = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useTokenContext must be used within TokenProvider");
  }
  return context;
};