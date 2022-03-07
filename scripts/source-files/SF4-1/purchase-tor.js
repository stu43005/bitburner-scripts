/** @param {NS} ns **/
export async function main(ns) {
    if (!ns.getPlayer().tor) {
        ns.purchaseTor();
    }
    if (ns.getPlayer().tor) {
        const programs = [
            "BruteSSH.exe",
            "FTPCrack.exe",
            "relaySMTP.exe",
            "HTTPWorm.exe",
            "SQLInject.exe",
            // "AutoLink.exe",
            // "DeepscanV1.exe",
            // "DeepscanV2.exe",
            // "ServerProfiler.exe",
            // "Formulas.exe",
        ];
        for (const program of programs) {
            if (!ns.fileExists(program, "home")) {
                ns.purchaseProgram(program);
            }
        }
    }
}
