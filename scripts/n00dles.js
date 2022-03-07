/** @param {NS} ns **/
export async function main(ns) {
    const target = "n00dles";
    const moneyThresh = ns.getServerMaxMoney(target) * 0.75;
    const securityThresh = ns.getServerMinSecurityLevel(target) + 5;

    ns.nuke(target);

    await ns.hack(target);
    await ns.weaken(target);
    await ns.grow(target);
    await ns.weaken(target);
    await ns.hack(target);

    while (true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            await ns.grow(target);
        } else {
            await ns.hack(target);
        }
    }
}