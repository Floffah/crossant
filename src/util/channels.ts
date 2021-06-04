import { DMChannel, TextChannel, User } from "discord.js";

export type Sendable = DMChannel | TextChannel | User;
export type SendableChannel = DMChannel | TextChannel;
