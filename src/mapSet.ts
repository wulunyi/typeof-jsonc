export default class MapSet<T = any> {
    private $map: Map<any, Set<T>> = new Map();

    public add(key: any, value: T) {
        const cacheSet = this.$map.get(key);

        if (!cacheSet) {
            this.$map.set(key, new Set([value]));
        } else {
            cacheSet.add(value);
        }
    }

    public get(key: any): T[] {
        const set = this.$map.get(key);

        return set ? [...set] : [];
    }
}
