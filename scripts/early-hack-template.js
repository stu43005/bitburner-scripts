/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    ns.enableLog("grow");
    ns.enableLog("weaken");
    ns.enableLog("hack");

    var target = ns.args[0] ? `${ns.args[0]}` : "joesguns";

    // if (ns.fileExists("BruteSSH.exe", "home")) {
    //     ns.brutessh(target);
    // }
    // ns.nuke(target);

    while (true) {
        // Defines how much money a server should have before we hack it
        // In this case, it is set to 75% of the server's max money
        let serverMaxMoney = ns.getServerMaxMoney(target);
        let currentMoney = ns.getServerMoneyAvailable(target);
        let moneyThresh = serverMaxMoney * 0.75;

        // Defines the maximum security level the target server can
        // have. If the target's security level is higher than this,
        // we'll weaken it before doing anything else
        let minSecurity = ns.getServerMinSecurityLevel(target);
        let securityThresh = minSecurity + 5;
        let currentSecurity = ns.getServerSecurityLevel(target);

        ns.print(`\n\n`);
        ns.print(`Target: ${target}`);
        ns.print(`Money: \$${currentMoney.toLocaleString()}`);
        ns.print(`Max Money: \$${serverMaxMoney.toLocaleString()}`);
        ns.print(`Thresh Dist: \$${(moneyThresh - currentMoney).toLocaleString()}`);
        ns.print(`Security: ${currentSecurity.toLocaleString()}`);
        ns.print(`Threshold: ${securityThresh.toLocaleString()}`);

        if (currentSecurity > securityThresh) {
            // If the server's security level is above our threshold, weaken it
            ns.print(`weakening ${target}...`);
            const res = await ns.weaken(target);
            // ns.toast(`Weakened ${target}! ${res}`);
        } else if (currentMoney < moneyThresh) {
            // If the server's money is less than our threshold, grow it
            ns.print(`growing ${target}...`);
            const res = await ns.grow(target);
            // ns.toast(`Grown ${target}! %${((res - 1) * 100).toFixed(3)}`);
        } else {
            // Otherwise, hack it
            // ns.toast(`hacking ${target}...`, "info");
            ns.print(`hacking ${target}...`);
            let stolen = await ns.hack(target);
            // ns.print(`Stolen ${Math.round(stolen)}`);
            // ns.toast(`Hacked ${target}! \$${Math.round(stolen)}`);
        }
    }
}