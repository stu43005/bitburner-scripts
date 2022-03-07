import { disableLog, listServers } from "./functions.js";

/** @param {NS} ns **/
export async function main(ns) {
    disableLog(ns);
    let args = ns.flags([
        ['all', false],
        ['user', false],
        ['sort', "hack"],
        ['desc', false],
    ]);

    const servers = listServers(ns, {
        withoutPurchasedServers: !args.user,
        includeHome: args.user,
        hasRootAccess: !args.all,
    }).sort((a, b) => {
        // default sort by hacking level
        let key = [ns.getServerRequiredHackingLevel(a), ns.getServerRequiredHackingLevel(b)];
        if (args.sort === "port") {
            key = [ns.getServerNumPortsRequired(a), ns.getServerNumPortsRequired(b)];
        }
        else if (args.sort === "ram") {
            key = [ns.getServerMaxRam(a), ns.getServerMaxRam(b)];
        }
        else if (args.sort === "money") {
            key = [ns.getServerMaxMoney(a), ns.getServerMaxMoney(b)];
        }
        if (args.desc) {
            return key[1] - key[0];
        }
        return key[0] - key[1];
    });
    const maxServerNameLength = Math.max(...servers.map(s => s.length));

    for (const server of servers) {
        const rooted = ns.hasRootAccess(server);
        const hackingLevel = ns.getServerRequiredHackingLevel(server);
        const ports = ns.getServerNumPortsRequired(server);
        const ram = ns.getServerMaxRam(server) * 1e9;
        const money = ns.getServerMoneyAvailable(server);
        const maxMoney = ns.getServerMaxMoney(server);

        let str = `[${server.padEnd(maxServerNameLength)}]${rooted ? "#" : " "} Hack: ${`${hackingLevel}`.padStart(4)}, Port: ${ports}`;
        if (ram > 0) {
            str += `, RAM: ${ns.nFormat(ram, "0b").padStart(5)}`;
        } else {
            str += `, RAM:   ---`;
        }
        if (maxMoney > 0) {
            str += `, Max Money: ${ns.nFormat(maxMoney, "$0.000a").padStart(9)} (${(money / maxMoney * 100).toFixed(2).padStart(6)}%)`;
        }
        ns.tprint(str);
    }
}
