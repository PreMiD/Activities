type LRUKey = string | number | symbol
/**
 * @example
 * ```js
 * it = new SimpleLRU(2)
 * it.set("game", "Yume Nikki")
 * it.set("name", "Madotsuki")
 * it.set("age", 12)
 *
 * it.get("game") // undefined cuz already been evicted
 * it.get("name") // Madotsuki
 * it.get("age") // 12
 * ```
 */
export class SimpleLRU<V = unknown> {
  protected queue: LRUKey[] = []
  protected map = new Map<LRUKey, V>()
  constructor(protected cap: number) {
    this.clear()
  }

  protected bubbleUp(key: LRUKey) {
    if (key === this.queue.at(0))
      return
    this.queue.sort(a => (a === key ? -1 : 0))
  }

  has(key: LRUKey) {
    return this.map.has(key)
  }

  set(key: LRUKey, value: V) {
    if (this.map.has(key)) {
      this.bubbleUp(key)
    }
    else {
      const lastKey = this.queue.at(-1)!
      this.bubbleUp(lastKey)
      this.map.delete(lastKey)
      this.queue[0] = key
    }
    this.map.set(key, value)
    return this
  }

  get(key: LRUKey): V {
    const result = this.map.get(key)
    if (result)
      this.bubbleUp(key)
    return result!
  }

  clear() {
    // eslint-disable-next-line symbol-description
    this.queue = Array.from(Array.from({ length: this.cap }).keys()).map(() => Symbol())
    this.map.clear()
  }
}
