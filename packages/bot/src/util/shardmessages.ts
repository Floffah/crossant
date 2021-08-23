export type ShardMessage = CheckShardMessage | RespawnShardMessage;

export interface BaseShardMessage {
    type: "check" | "respawn";
    data?: any;
}

export interface CheckShardMessage extends BaseShardMessage {
    type: "check";
    data?: undefined;
}

export interface RespawnShardMessage extends BaseShardMessage {
    type: "respawn";
    data?: {
        ids?: number[];
    };
}
