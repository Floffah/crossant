export type ShardMessage = CheckShardMessage;

export interface BaseShardMessage {
    type: "check";
    data?: any;
}

export interface CheckShardMessage extends BaseShardMessage {
    type: "check";
    data?: undefined;
}
