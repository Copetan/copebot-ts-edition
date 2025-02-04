import { CommandInteraction, SlashCommandBuilder } from "npm:discord.js@14.17.3";

type Command = {
    data: SlashCommandBuilder,
    execute: (interaction: CommandInteraction) => Promise<void>
}

declare enum LACoClosureStatus {
    CLOSED = 'Road Closed',
    EMERGENCY = 'Road Closed. Only Open To Emergency Vehicles',
    RESIDENTS = 'Road Closed. Only Open To Residents & Emergency Vehicles',
    CONTRACTORS = 'Road Closed. Only Open To Contractors, Residents. & Emergency Vehicles',
    LANE = 'Lane Closed',
    CONSTRUCTION = 'Construction Zone. Expect Delays',
    LIMITED = 'Access Limited, Expect Delays',
    OTHER = 'Other'
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