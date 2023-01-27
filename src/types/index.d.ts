export type SetInterval = ReturnType<typeof setInterval>;

export type Rewrite<T, U> = Omit<T, keyof U> & U;

export interface SendMessage {
  roomid: string;
  msg: string;
  dm_type?: string;
  isInitiative?: boolean;
}

export type Stream = {
  type: string;
  url: string;
  ext: string;
};
