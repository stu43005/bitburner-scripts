import { copyAndRun, disableLog, listServers } from "./functions.js";

/** @param {NS} ns **/
export async function main(ns) {
    disableLog(ns);

    const hostServers = listServers(ns, {
        includeHome: true,
        hasRootAccess: true,
    });

    const targetServers = listServers(ns, {
        hasRootAccess: true,
        enoughHackingLevel: true,
        hasMoney: true,
        highestProduction: 25,
    });

    for (const hostname of hostServers) {
        const saveRam = hostname == "home" ? 128 : 0;
        await setupHackScripts(ns, hostname, saveRam, ...targetServers);
    }
}

/**
 * @param {NS} ns
 * @param {string} hostname
 * @param {number} save
 * @param {Array<string>} targetServers
 **/
export async function setupHackScripts(ns, hostname, save = 0, ...targetServers) {
    const scripts = {
        "/Summertime/hackloop.js": 1,
        "/Summertime/secloop.js": 2,
        "/Summertime/growloop.js": 10,
    };
    const sumPart = Object.values(scripts).reduce((acc, cur) => acc + cur, 0);

    if (ns.getServerMaxRam(hostname) < 8) {
        await copyAndRun(ns, "early-hack-template.js", hostname, save, 1, ...targetServers);
        return;
    }

    if (ns.scriptRunning("early-hack-template.js", hostname)) {
        ns.scriptKill("early-hack-template.js", hostname);
    }
    if (ns.scriptRunning("/Summertime/hackloop.js", hostname) && !ns.isRunning("/Summertime/hackloop.js", hostname, ...targetServers)) {
        for (const script of Object.keys(scripts)) {
            ns.scriptKill(script, hostname);
        }
    }
    if (targetServers.length > 0) {
        for (const script of Object.keys(scripts)) {
            await copyAndRun(ns, script, hostname, save - ns.getServerUsedRam(hostname), scripts[script] / sumPart, ...targetServers);
        }
    }
}
