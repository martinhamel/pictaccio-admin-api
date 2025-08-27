export type AllCallback = (error: string, sessions: any) => void;
export type DestroyCallback = (error: string) => void;
export type ClearCallback = (error: string) => void;
export type LengthCallback = (error: string, length: number) => void;
export type GetCallback = (error: string, session: any) => void;
export type SetCallback = (error: string) => void;
export type TouchCallback = (error: string) => void;

export interface SessionStoreInterface {
    all(callback: AllCallback): void;
    destroy(sessionId: string, callback: DestroyCallback): void;
    clear(callback: ClearCallback): void;
    length(callback: LengthCallback): void;
    get(sessionId: string, callback: GetCallback): void;
    set(sessionId: string, session: any, callback: SetCallback): void;
    touch(sessionId: string, session: any, callback: TouchCallback): void;
}
