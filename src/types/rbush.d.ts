declare module 'rbush' {
  interface BBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }

  class RBush<T extends BBox> {
    insert(item: T): this;
    remove(item: T): this;
    search(bbox: BBox): T[];
    load(items: T[]): this;
    clear(): this;
    all(): T[];
    collides(bbox: BBox): boolean;
    toJSON(): object;
    fromJSON(data: object): this;
  }

  export default RBush;
}
