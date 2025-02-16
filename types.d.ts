import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "npm:discord.js@14.17.3";
import { LACoClosureStatus } from "./road-closures.ts";

type Command = {
    data: SlashCommandBuilder,
    execute: (interaction: CommandInteraction) => Promise<void>
}

type LACoClosure = {
    isActive: boolean,
    community: string,
    location: string,
    status: LACoClosureStatus,
    reason: string,
    beginDate: number | string,
    endDate: number | string,
    district: number
}

type Holder<T> = {
    get: T
}

export type JurisdictionMap = {
    [key: string]: () => Promise<Holder<EmbedBuilder>[]>
}