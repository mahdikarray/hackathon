import en from "./game-messages.en.json";
import fr from "./game-messages.fr.json";
import ar from "./game-messages.ar.json";

export interface GameMessage {
  id: number;
  text: string;
  isScam: boolean;
  explanation: string;
}

export type Language = "en" | "fr" | "ar";

const messages: Record<Language, GameMessage[]> = {
  en,
  fr,
  ar,
};

export function getMessages(lang: Language): GameMessage[] {
  return messages[lang] || messages.en;
}