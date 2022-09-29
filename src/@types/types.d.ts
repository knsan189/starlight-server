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
}

declare global {
  interface String {
    format: (...args: any) => string;
  }
}
