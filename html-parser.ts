#!/usr/bin/env -S deno run -A

import * as cheerio from 'npm:cheerio@1.0.0';
import { LACoClosure } from './types.d.ts';
import { LACoClosureStatus, laCoClosureStatusMap } from "./road-closures.ts";

export async function getLACoRoadClosures() {
    const $ = await cheerio.fromURL('https://pw.lacounty.gov/roadclosures/list_closures.cfm');
    return $.extract({
        closures: [
            {
                selector: 'table.closuresList tr[onmouseover]',
                value: (element): LACoClosure => {
                    const location = $('td:nth(0)', element).text().split(':');
                    const status = $('td:nth(1) font', element);
                    const beginDateString = $('td:nth(3)', element).text();
                    const beginDate = Date.parse(beginDateString);
                    const endDateString = $('td:nth(4)', element).text();
                    const endDate = Date.parse(endDateString);

                    return {
                        isActive: status.attr('color') !== '#ab7200',
                        community: location[0].trim(),
                        location: location[1].trim(),
                        status: laCoClosureStatusMap.get(status.text()) ?? LACoClosureStatus.UNKNOWN,
                        reason: $('td:nth(2)', element).text().trim(),
                        beginDate: !Number.isNaN(beginDate) ? beginDate : beginDateString,
                        endDate: !Number.isNaN(endDate) ? endDate : endDateString,
                        district: parseInt($('td:nth(5)', element).text())
                    };
                }
            }
        ]
    });
}

//console.log(await getLACoRoadClosures());