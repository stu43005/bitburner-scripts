/**
 * @param {NS} ns
 **/
export function disableLog(ns) {
    ns.disableLog("disableLog");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("getServerMaxMoney");
    ns.disableLog("sleep");
    ns.disableLog("scan");
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMaxRam");
    ns.disableLog("getServerUsedRam");
    ns.disableLog("getScriptRam");
    ns.disableLog("getServerRequiredHackingLevel");
    ns.disableLog("getUpgradeHomeRamCost");
    ns.disableLog("getUpgradeHomeCoresCost");
    ns.disableLog("stock.getSymbols");
}

/**
 * @param {NS} ns
 * @param {string} script
 * @param {string} hostname
 * @param {number} save
 * @param {number} ratio
 **/
export function getCanRunThreads(ns, script, hostname, save = 0, ratio = 1) {
    const scriptRam = ns.getScriptRam(script, hostname);
    const serverRam = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname) - save;
    let numThreads = Math.floor(serverRam / scriptRam * ratio);

    const serverAvailableRam = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname);
    if (numThreads < 1 && scriptRam < serverAvailableRam) return 1;

    while (numThreads * scriptRam > serverAvailableRam) {
        numThreads--;
    }
    return numThreads;
}

/**
 * @param {NS} ns
 * @param {string} script
 * @param {string} hostname
 * @param {number} save
 * @param {number} ratio
 * @param {Array<string>} script_args
 **/
export async function copyAndRun(ns, script, hostname, save = 0, ratio = 1, ...script_args) {
    if (ns.scriptRunning(script, hostname) && !ns.isRunning(script, hostname, ...script_args)) {
        ns.scriptKill(script, hostname);
    }
    if (!ns.isRunning(script, hostname, ...script_args)) {
        if (hostname !== "home") {
            await ns.scp(script, "home", hostname);
        }
        const threads = getCanRunThreads(ns, script, hostname, save, ratio);
        if (threads > 0) {
            ns.exec(script, hostname, threads, ...script_args);
        }
    }
}

/**
 * @param {NS} ns
 * @param {string} hostname
 **/
export function jailbreakServer(ns, hostname) {
    let num = ns.getServerNumPortsRequired(hostname);
    if (num > 0 && ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(hostname);
        num--;
    }
    if (num > 0 && ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(hostname);
        num--;
    }
    if (num > 0 && ns.fileExists("relaySMTP.exe", "home")) {
        ns.relaysmtp(hostname);
        num--;
    }
    if (num > 0 && ns.fileExists("HTTPWorm.exe", "home")) {
        ns.httpworm(hostname);
        num--;
    }
    if (num > 0 && ns.fileExists("SQLInject.exe", "home")) {
        ns.sqlinject(hostname);
        num--;
    }
    if (num <= 0) {
        ns.nuke(hostname);
        return true;
    }
    return false;
}

/**
 * @param {NS} ns
 * @param {string} parent
 * @param {string} server
 * @param {Array<string>} list
 **/
export function scanList(ns, parent, server, list) {
    const children = ns.scan(server);
    for (let child of children) {
        if (parent == child) {
            continue;
        }
        list.push(child);

        scanList(ns, server, child, list);
    }
}

/**
 * @typedef ServerFilter
 * @type {object}
 * @property {boolean=} enoughHackingLevel
 * @property {boolean=} withoutPurchasedServers
 * @property {boolean=} hasRootAccess
 * @property {boolean=} hasMoney
 * @property {boolean=} includeHome
 * @property {number=} highestProduction
 * @property {number=} minRam
 */

/**
 * @param {NS} ns
 * @param {ServerFilter} filter
 **/
export function listServers(ns, filter = {}) {
    /** @type {Array<string>} */
    let list = [];
    scanList(ns, '', 'home', list);

    if (filter.enoughHackingLevel) {
        list = list.filter((hostname) => ns.getServerRequiredHackingLevel(hostname) <= ns.getHackingLevel());
    }

    if (filter.withoutPurchasedServers) {
        const pserv = ns.getPurchasedServers();
        list = list.filter((hostname) => !pserv.includes(hostname));
    }

    if (filter.hasRootAccess) {
        list = list.filter((hostname) => ns.hasRootAccess(hostname) || jailbreakServer(ns, hostname));
    }

    if (filter.hasMoney) {
        list = list.filter((hostname) => ns.getServerMaxMoney(hostname) > 0);
    }

    if (filter.minRam && filter.minRam > 0) {
        list = list.filter((hostname) => ns.getServerMaxRam(hostname) >= (filter.minRam || 0));
    }

    if (filter.highestProduction && filter.highestProduction > 0 && list.length > filter.highestProduction) {
        /** @type {[string, number][]} */
        const serverMoney = list.map((hostname) => [hostname, ns.getServerMaxMoney(hostname)]);
        const highestProduction = serverMoney
            .sort((a, b) => b[1] - a[1])
            .slice(0, filter.highestProduction)
            .map(a => a[0]);
        list = list.filter((hostname) => highestProduction.includes(hostname));
    }

    if (filter.includeHome) {
        list.unshift("home");
    }

    return list;
}

/**
 * @template T
 * @param {T[]} array
 **/
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

/**
 * @template T
 * @param {T[]} array
 * @param {number} perChunk
 **/
export function chunkArray(array, perChunk) {
    /** @type {T[][]} */
    const resultArray = [];
    return array.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / perChunk);

        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; // start a new chunk
        }

        resultArray[chunkIndex].push(item);

        return resultArray;
    }, resultArray);
}
