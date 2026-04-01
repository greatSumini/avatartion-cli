export type PartCategory = 'face' | 'hair' | 'eyes' | 'mouth' | 'outfit' | 'accessories' | 'facialHair';

export interface AvatarConfig {
  face: number;      // 1-8
  hair: number;      // 1-32
  eyes: number;      // 1-6
  mouth: number;     // 1-10
  outfit: number;    // 1-25
  accessories: number; // 1-10
  facialHair: number;  // 1-8
  background: string;  // background name
}

export const PART_LIMITS: Record<PartCategory, number> = {
  face: 8,
  hair: 32,
  eyes: 6,
  mouth: 10,
  outfit: 25,
  accessories: 10,
  facialHair: 8,
};
