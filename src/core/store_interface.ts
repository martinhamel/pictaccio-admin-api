type Resolve<T, Async extends boolean> = Async extends true ? Promise<T> : T;

export interface StoreInterface<TtypeMap, Async extends boolean = false> {
    has<Tkey extends keyof TtypeMap>(key: Tkey): Resolve<boolean, Async>;
    get<Tkey extends keyof TtypeMap>(key: Tkey): Resolve<TtypeMap[Tkey], Async>;
    set<Tkey extends keyof TtypeMap>(key: Tkey, value: TtypeMap[Tkey]): Resolve<void, Async>;
    remove<Tkey extends keyof TtypeMap>(key: Tkey): Resolve<void, Async>;
}
