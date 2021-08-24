export const defaultConfig = {
    bot: {
        token: "token here",
        defaultPrefix: "!",
        supportGuild: "872068506886217790",
        owners: ["221524691079266314"],
    },

    sentry: {
        dsn: "https://examplePublicKey@example.ingest.sentry.io/example",
        releases:
            "`https://sentry.io/api/0/organizations/example-aa/releases/`",
        authToken: "example_token",
        lastCommit: undefined as undefined | string, // bot manages automatically
    } as
        | {
              dsn: string;
              lastCommit?: string;
              releases: string;
              authToken: string;
          }
        | undefined,
};

export type Config = typeof defaultConfig;
