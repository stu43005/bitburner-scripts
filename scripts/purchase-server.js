import { disableLog } from "./functions.js";

/** @param {NS} ns **/
export async function main(ns) {
    disableLog(ns);

    let ram = 8;
    const serverLimit = ns.getPurchasedServerLimit();
    const allowMaxCost = ns.getServerMoneyAvailable("home") / serverLimit;
    const maxRam = ns.getPurchasedServerMaxRam();
    for (let checkRam = 8; checkRam <= maxRam; checkRam *= 2) {
        if (allowMaxCost > ns.getPurchasedServerCost(checkRam)) {
            ram = checkRam;
        }
    }

    for (const hostname of ns.getPurchasedServers()) {
        if (ns.getServerMaxRam(hostname) < ram) {
            // less then target mem, delete
            ns.killall(hostname);
            ns.deleteServer(hostname);
        }
    }

    const cost = ns.getPurchasedServerCost(ram);
    while (ns.getPurchasedServers().length < serverLimit) {
        // Check if we have enough money to purchase a server
        if (ns.getServerMoneyAvailable("home") >= cost) {
            // If we have enough money
            ns.purchaseServer("pserv", ram);
        } else {
            ns.print("Need $" + cost + " . Have $" + ns.getServerMoneyAvailable("home"));
        }
        await ns.sleep(1000);
    }
}
