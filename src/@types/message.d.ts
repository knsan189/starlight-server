export interface MessageResponse {
  reply?: string;
  secondReply?: string;

  /** 밀리세컨드 딜레이 */
  delayTime?: number;
  status: string;
}
