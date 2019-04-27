export default class MapSet<T = any> {
    private $map: Map<any, Set<T>> = new Map();

    public add(key: any, value: T) {
        if (!this.$map.get(key)) {
            this.$map.set(key, new Set());
        }

        this.$map.get(key)!.add(value);
    }

    public get(key: any): T[] {
        const set = this.$map.get(key);

        return set ? [...set] : [];
    }
}
