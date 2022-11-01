interface LoaEvent {
  title: string;
  contents: Content[];
}

interface Content {
  time: string;
  name: string;
}

export interface Fortune {
  id: number;
  msg?: string | null;
  fortune: string;
  delayTime: number;
}

export interface Jewel {
  name: string;
  img: string;
  level: string;
  skill: string;
  grade: number;
}

export interface UserData {
  charLevel: string;
  charClass: string;
  charImg: string;
  itemLevel: string;
  serverName: string;
  guildName: string;
  equipments: string[];
  abilities: string[];
  engraves: string[];
  jewels: Jewel[];
}

export interface DiscordHistory {
  time: Date;
  nickname: string;
  type: "join" | "leave";
}

declare global {
  interface String {
    format: (...args: any) => string;
  }
}
