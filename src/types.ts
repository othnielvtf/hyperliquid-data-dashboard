export interface Trade {
  time: Date;
  coin: string;
  dir: string;
  px: number;
  sz: number;
  ntl: number;
  fee: number;
  closedPnl: number;
}