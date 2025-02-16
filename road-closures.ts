import { JurisdictionMap, Holder } from "./types.d.ts";
import { getLACoRoadClosures } from "./html-parser.ts";
import { EmbedBuilder, time, TimestampStyles } from "npm:discord.js@14.17.3";

export enum LACoClosureStatus {
    CLOSED = 'Road Closed',
    EMERGENCY = 'Road Closed. Only Open To Emergency Vehicles',
    RESIDENTS = 'Road Closed. Only Open To Residents & Emergency Vehicles',
    CONTRACTORS = 'Road Closed. Only Open To Contractors, Residents. & Emergency Vehicles',
    LANE = 'Lane Closed',
    CONSTRUCTION = 'Construction Zone. Expect Delays',
    LIMITED = 'Access Limited, Expect Delays',
    OTHER = 'Other',
    UNKNOWN = 'Unknown! Please report this to the bot developer.'
}

export const laCoClosureStatusMap = new Map<string,LACoClosureStatus>(Object.values(LACoClosureStatus).map(
    (status) => [`${status}`, status] as const
));

export const laCoColorMap = new Map<LACoClosureStatus,number>([
    [LACoClosureStatus.CLOSED, 0xe60000],
    [LACoClosureStatus.EMERGENCY, 0x33ccff],
    [LACoClosureStatus.RESIDENTS, 0xffaa00],
    [LACoClosureStatus.CONTRACTORS, 0xd74599],
    [LACoClosureStatus.LANE, 0x00734c],
    [LACoClosureStatus.CONSTRUCTION, 0x000000],
    [LACoClosureStatus.LIMITED, 0x0000ff],
    [LACoClosureStatus.OTHER, 0x0080c0],
    [LACoClosureStatus.UNKNOWN, 0x808080]
]);

async function laEmbedMaker(): Promise<Holder<EmbedBuilder>[]> {
    const roadClosures = (await getLACoRoadClosures()).closures;
    const embeds: Holder<EmbedBuilder>[] = [];

    for (let i = 0; i < roadClosures.length; i++){
        const closure = roadClosures[i];
        embeds.push({
            get get() {
                return new EmbedBuilder()
                    .setColor(closure.isActive ? laCoColorMap.get(closure.status)! : 0xab7200)
                    .setAuthor({name: `${closure.status}${closure.isActive ? '' : " (Planned)"}`})
                    .setTitle(closure.location)
                    .setDescription(closure.reason)
                    .addFields(
                        {name: 'Community', value: closure.community, inline: true},
                        {name: 'District', value: closure.district.toString(), inline: true}
                    )
                    .addFields({name: 'Begin Date', value: dateString(closure.beginDate)})
                    .addFields({name: 'Estimated End Date', value: dateString(closure.endDate)})
                    .setFooter({
                        text: `Los Angeles County, closure ${i + 1} of ${roadClosures.length}`,
                        iconURL: 'https://cdn.discordapp.com/emojis/1339131277969985556.png'
                    })
                    .setTimestamp()
            }
        })
    }

    return embeds;
}

export const jurisdictionMap: JurisdictionMap = {
    'county_la': laEmbedMaker,
    // deno-lint-ignore require-await
    'invalid': async () => [{ get: new EmbedBuilder().setDescription('Invalid jurisdiction') }]
};

function dateString(date: number | string): string {
    if (typeof date === 'number') {
        const theDate = new Date(date);
        return `${time(theDate, TimestampStyles.ShortDateTime)} (${time(theDate, TimestampStyles.RelativeTime)})`
    } else {
        return date;
    }
}