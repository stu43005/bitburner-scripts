import { disableLog } from "./functions.js";

/**
 * @typedef ScriptDefine
 * @property {string} server
 * @property {string | string[]} script
 * @property {number=} minMoney
 * @property {number=} minHackingLevel
 * @property {[n: number, lvl: number]=} hasSourceFile
 * @property {(ns: NS)=>boolean=} condition
 */

/** @type {ScriptDefine[]} */
const runScripts = [
    {
        server: "foodnstuff",
        script: "n00dles.js",
    },
    // {
    //     server: "home",
    //     script: "setup-server.js",
    // },
    {
        server: "sigma-cosmetics",
        script: "buy-hacknet-2.js",
    },
    {
        server: "foodnstuff",
        script: "/steamsplay/auto_farm.js",
    },
    {
        server: "home",
        script: "purchase-server.js",
        minMoney: 11000000,
    },
    {
        server: "home",
        script: "/steamsplay/stockbot.js",
        minMoney: 50000000,
        condition: (ns) => {
            try {
                ns.stock.getSymbols();
                return true;
            } catch (error) {
                return false;
            }
        }
    },
    {
        server: "home",
        script: "/source-files/SF4-1/purchase-tor.js",
        minMoney: 200000,
        hasSourceFile: [4, 1],
    },
    {
        server: "home",
        script: "/source-files/SF4-1/install-backdoor.js",
        minHackingLevel: 51,
        hasSourceFile: [4, 1],
    },
];

/** @param {NS} ns **/
export async function main(ns) {
    disableLog(ns);

    while (true) {
        for (const sc of runScripts) {
            if (sc.minMoney && sc.minMoney > 0 && ns.getServerMoneyAvailable('home') < sc.minMoney) continue;
            if (sc.minHackingLevel && sc.minHackingLevel > 0 && ns.getHackingLevel() < sc.minHackingLevel) continue;
            if (sc.hasSourceFile && !hasSourceFile(ns, sc.hasSourceFile)) continue;
            if (sc.condition && !sc.condition(ns)) continue;

            const targetScript = typeof sc.script === "string" ? sc.script : sc.script[0];

            if (!ns.isRunning(targetScript, sc.server)) {
                if (sc.server !== "home") {
                    ns.nuke(sc.server);
                    await ns.scp(sc.script, "home", sc.server);
                }
                ns.exec(targetScript, sc.server);
            }
        }

        await ns.sleep(60 * 1000);
    }
}

/**
 * 
 * @param {NS} ns
 * @param {[number, number]} sourceFile 
 */
function hasSourceFile(ns, sourceFile) {
    const owned = ns.getOwnedSourceFiles();
    return !!owned.find((s) => s.n === sourceFile[0] && s.lvl >= sourceFile[1]);
}

/*
// buy TOR Router: 200k
buy -l;
buy BruteSSH.exe;
buy DeepscanV1.exe;
buy ServerProfiler.exe;
buy AutoLink.exe;
buy FTPCrack.exe;
buy relaySMTP.exe;
buy DeepscanV2.exe;
buy HTTPWorm.exe;
buy SQLInject.exe;
buy Formulas.exe;
buy -l;

home; run find_server.js CSEC;
backdoor; // !!! CyberSec  Hack:53

home; run find_server.js avmnite-02h;
backdoor; // !!! NiteSec  Hack:217

home; run find_server.js I.I.I.I;
backdoor; // !!! The Black Hand  Hack:345

home; run find_server.js run4theh111z;
backdoor; // !!! BitRunners  Hack:527

home; run find_server.js fulcrumassets;
backdoor; // !!! Fulcrum Secret Technologies  Hack:1104

home; run find_server.js w0r1d_d43m0n;
backdoor; // !!!

*/
