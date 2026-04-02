import type { Hexagram } from '../types/hexagram';

export interface HexagramAPI {
  getAll(): Promise<Hexagram[]>;
  getById(id: string): Promise<Hexagram>;
  getRandom(): Promise<Hexagram>;
}
