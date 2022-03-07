import { disableLog, listServers } from "../../functions.js";

/** @param {NS} ns **/
export async function main(ns) {
    disableLog(ns);

    const installed = [];

    while (true) {
        const allServers = listServers(ns, {
            enoughHackingLevel: true,
            hasRootAccess: true,
        });

        for (const hostname of allServers) {
            if (installed.includes(hostname)) continue;

            try {
                if (!connectTo(ns, hostname)) continue;
                await ns.installBackdoor();
                connectTo(ns, "home");
                installed.push(hostname);
            } catch (error) {
            }
        }

        await ns.sleep(10 * 1000);
    }
}

/** 
 * @param {NS} ns
 * @param {string} target
 **/
function connectTo(ns, target) {
    /** @type {string[]} */
    const route = [];
    recursiveScan(ns, '', ns.getCurrentServer(), target, route);
    for (let i = 1; i < route.length; i++) {
        const server = route[i];
        if (!ns.connect(server)) {
            return false;
        }
    }
    return true;
}

/** 
 * @param {NS} ns
 * @param {string} parent
 * @param {string} server
 * @param {string} target
 * @param {string[]} route
 **/
function recursiveScan(ns, parent, server, target, route) {
    const children = ns.scan(server);
    for (let child of children) {
        if (parent == child) {
            continue;
        }
        if (child == target) {
            route.unshift(child);
            route.unshift(server);
            return true;
        }

        if (recursiveScan(ns, server, child, target, route)) {
            route.unshift(server);
            return true;
        }
    }
    return false;
}
