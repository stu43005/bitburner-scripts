/** @param {NS} ns**/
export async function main(ns) {
    ns.disableLog("ALL"); //Visual clarity

    //Welcome to the Auto Farm part 2: Electric Boogaloo
    //This script is a little more complicated to explain easily, it dedicates high RAM servers to attack high profit servers
    //This is also set and forget, your EXEs and hacking level are reacquired each second, so new servers are added without needing to reboot it
    //Well I hope this brings you ideas, knowledge and or profits :D

    var files = ["weak.script", "grow.script", "hack.script"];//No touching, unless you understand everything here
    await ns.write(files[0], "weaken(args)", "w"); await ns.write(files[1], "grow(args)", "w"); await ns.write(files[2], "hack(args)", "w");

    var serverList; var targetList; var hostList; var exes; var temp; var manager = false;
    var cycle = [0, "─", "\\", "|", "/"]; var latest = [["-", "-"], ["-", "-"], ["-", "-"]];
    if (false) { brutessh(); ftpcrack(); relaysmtp(); httpworm(); sqlinject() } //Avoid RAM cost bypass error

    var pServers = true;//await ns.prompt("Use player servers as hosts?");

    async function scanExes() {
        exes = ["BruteSSH", "FTPCrack", "relaySMTP", "SQLInject", "HTTPWorm"];
        for (let i = 0; i <= exes.length - 1; i++) { if (!ns.fileExists(exes[i] + ".exe", "home")) { exes.splice(i, 1); i-- } }//Removes EXEs you don't have
    }

    function arraySort(array) { return array.sort(function (a, b) { return b[0] - a[0] }) }//Sorts nested arrays
    function logBalance(server) {//For balance in display
        return [ns.nFormat(ns.getServerMoneyAvailable(server), '0a')] + " / " + [ns.nFormat(ns.getServerMaxMoney(server), '0a')]
            + " : " + ns.nFormat(ns.getServerMoneyAvailable(server) / ns.getServerMaxMoney(server), '0%')
    }

    async function log() {//The display
        if (cycle[0] >= 4) { cycle[0] = 0 }; cycle[0]++;//Speen
        ns.clearLog();
        ns.print("╔═══╦═╣ HOST ╠════════════════╣ TARGET ╠═╗");
        ns.print("║ G ║ " + latest[0][0] + latest[0][1].padStart(34 - latest[0][0].length) + " ║")
        ns.print("║ W ║ " + latest[1][0] + latest[1][1].padStart(34 - latest[1][0].length) + " ║")
        ns.print("║ H ║ " + latest[2][0] + latest[2][1].padStart(34 - latest[2][0].length) + " ║")
        ns.print("║ " + cycle[cycle[0]] + " ╠════════════════════════════════════╣")
        if (targetList.length < 6) { ns.print("╚═══╝ ║") } else {
            ns.print("╠═══╝ Priority Servers Balance           ║")
            for (let i = 0; i < 6; i++) {
                temp = targetList[i][1];
                ns.print("║ > " + temp + logBalance(temp).padStart(36 - temp.length) + " ║")
            }
            ns.print("╠════════════════════════════════════════╝")
            ns.print("║ EXE " + exes.length + "/5 ║ HOSTS " + hostList.length + " ║ TARGETS " + targetList.length)
            ns.print("╠════════════════════════════════════════╗")
            if (manager) {
                ns.print("╠══════╣ Managing " + ns.hacknet.numNodes() + " HNet Nodes ╠".padEnd(21, "═") + "╣")
            }
        }
    }

    async function scanServers() {//Finds all servers
        serverList = ns.scan("home"); let serverCount = [serverList.length, 0]; let depth = 0; let checked = 0; let scanIndex = 0;
        while (scanIndex <= serverCount[depth] - 1) {
            let results = ns.scan(serverList[checked]); checked++;
            for (let i = 0; i <= results.length - 1; i++) {
                if (results[i] != "home" && !serverList.includes(results[i])) {
                    serverList.push(results[i]); serverCount[depth + 1]++
                }
            }
            if (scanIndex == serverCount[depth] - 1) { scanIndex = 0; depth++; serverCount.push(0) } else { scanIndex++ };
        }
    }

    async function checkServers() {//Sorts servers into lists based on RAM and money/hack time ratio: hostList and targetList
        targetList = []; hostList = [[ns.getServerMaxRam("home"), "home"]];
        if (pServers) {//Adds in player servers
            temp = ns.getPurchasedServers();
            for (let i = 0; i < temp.length; i++) {
                hostList.push([ns.getServerMaxRam(temp[i]), temp[i]])
                await ns.scp(files, "home", temp[i]);
            }
        }
        for (let i = 0; i <= serverList.length - 1; i++) {
            let cTarget = serverList[i];
            // if (ns.getServerMoneyAvailable(cTarget) > 0 || ns.getServerMaxRam(cTarget) > 2) {//Filters out servers like darkweb
                if (ns.getServerNumPortsRequired(cTarget) <= exes.length || ns.hasRootAccess(cTarget)) {
                    for (let i = 0; i <= exes.length - 1; i++) { ns[exes[i].toLowerCase()](cTarget) }//Runs all EXEs you have
                    ns.nuke(cTarget);//Ghandi.jpeg
                    temp = [Math.floor(ns.getServerMaxMoney(cTarget) / ns.getServerMinSecurityLevel(cTarget)), cTarget];
                    if (ns.getServerMoneyAvailable(cTarget) != 0 && !targetList.includes(temp) && ns.getServerRequiredHackingLevel(cTarget) <= ns.getHackingLevel()) {
                        targetList.push(temp); targetList = arraySort(targetList);
                    }
                    temp = [ns.getServerMaxRam(cTarget), cTarget];
                    if (ns.getServerMaxRam(cTarget) > 2 && !hostList.includes(cTarget)) {
                        hostList.push(temp); hostList = arraySort(hostList)
                    }
                    await ns.scp(files, "home", cTarget);
                }
            // }
            await ns.asleep(20);
        }
    }


    async function hackAll() {//Dedicates high RAM servers to attack high profit per second servers
        let tarIndex = 0; let loop = false;
        for (let i = 0; i <= hostList.length - 1; i++) {
            if (tarIndex > targetList.length - 1) { tarIndex = 0; loop = true };
            let hHost = hostList[i][1]; let hTarget = targetList[tarIndex][1]; let freeRam;
            if (hHost == "home") { freeRam = Math.max(ns.getServerMaxRam(hHost) - ns.getServerUsedRam(hHost) - 50, 0) } else {
                freeRam = ns.getServerMaxRam(hHost) - ns.getServerUsedRam(hHost)
            }
            if (freeRam >= 4) {
                let threads = Math.floor(freeRam / 1.75); let bThreads = 0;
                if (ns.getServerMoneyAvailable(hTarget) < ns.getServerMaxMoney(hTarget) * .70 || loop) {//Server money target here
                    latest[0][0] = hHost; latest[0][1] = hTarget;
                    if (threads > 2) {
                        ns.exec("weak.script", hHost, Math.ceil(0.08 * threads), hTarget);
                        ns.exec("grow.script", hHost, Math.floor(0.92 * threads), hTarget);
                    } else { ns.exec("grow.script", hHost, threads, hTarget) }
                } else if (ns.getServerSecurityLevel(hTarget) > ns.getServerMinSecurityLevel(hTarget) + 5) {//Security target here
                    latest[1][0] = hHost; latest[1][1] = hTarget;
                    ns.exec("weak.script", hHost, threads, hTarget);
                } else {
                    while (parseFloat(ns.hackAnalyze(hTarget)) * threads > .4) { threads--; bThreads++ }//Hack limit here
                    latest[2][0] = hHost; latest[2][1] = hTarget;
                    ns.exec("hack.script", hHost, threads, hTarget);
                    if (bThreads > 0) { ns.exec("weak.script", hHost, bThreads, hTarget) }
                }
            }
            tarIndex++;
            await ns.asleep(20);
        }
    }
    //Put modules below here
    // manager = await ns.prompt("Activate Hacknet Manager?");
    // async function hnManager() {
    //     let mode = ["Level", "Ram", "Core"]
    //     function check(q) { return eval(q < ns.getPlayer().money / 5) }
    //     if (check(ns.hacknet.getPurchaseNodeCost())) {
    //         ns.hacknet.purchaseNode();
    //     }
    //     for (let i = 0; i < ns.hacknet.numNodes(); i++) {
    //         for (let n = 0; n < 3; n++) {
    //             if (check(ns.hacknet["get" + mode[n] + "UpgradeCost"](i))) {
    //                 ns.hacknet["upgrade" + mode[n]](i);
    //             }
    //         }
    //     }
    // }
    //But above here
    ns.tail()
    while (true) {//Keeps everything running once per second
        try {
            await scanExes()
            await scanServers()
            await checkServers()
            await hackAll()
            if (manager) { await hnManager() }
            await log()
        } catch (error) {
            ns.print(`Error:`);
            ns.print(error);
        }
        await ns.asleep(1000)
    }
}