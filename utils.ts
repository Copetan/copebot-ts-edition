import { Command } from "./types.d.ts";

export async function parseCommands(worker: (command: Command) => void) {
    const commandsDir = './commands';
    for await (const commandFile of Deno.readDir(commandsDir)) {
        const command = await import(`${commandsDir}/${commandFile.name}`) as Command;
        if ( 'data' in command && 'execute' in command ) {
            console.info(`Loaded command: ${command.data.name}`);
            worker(command);
        } else {
            console.error(`Invalid command file: ${commandFile.name}`);
        }
    }
}

export function modulo(a: number, b: number) {
    return ((a % b) + b) % b;
}