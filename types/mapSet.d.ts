export default class MapSet<T = any> {
    private $map;
    add(key: any, value: T): void;
    get(key: any): T[];
}
