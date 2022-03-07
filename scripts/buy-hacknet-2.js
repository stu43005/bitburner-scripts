/** @param {NS} ns **/
export async function main(ns) {
	// Only buy nodes up to 23. Past that its not really worth it.
	const maxNodes = 23;
	const useRatio = 0.01;

	ns.disableLog("disableLog");
	ns.disableLog("getServerMoneyAvailable");
	ns.disableLog("sleep");
	ns.disableLog("getHackingLevel");
	ns.disableLog("getServerMaxRam");

	function myMoney() {
		const money = ns.getServerMoneyAvailable("home");

		const hackingSteps = [
			[0, 0],
		];
		if (!ns.fileExists("BruteSSH.exe", "home") || !ns.getPlayer().tor) {
			hackingSteps.push([50, (!ns.fileExists("BruteSSH.exe", "home") ? 5e5 : 0) + (!ns.getPlayer().tor ? 2e5 : 0)]);
		}
		if (!ns.fileExists("FTPCrack.exe", "home")) {
			hackingSteps.push([100, 1.5e6]);
		}
		if (!ns.fileExists("relaySMTP.exe", "home")) {
			hackingSteps.push([250, 5e6]);
		}
		if (!ns.fileExists("HTTPWorm.exe", "home")) {
			hackingSteps.push([500, 3e7]);
		}
		if (!ns.fileExists("SQLInject.exe", "home")) {
			hackingSteps.push([750, 2.5e8]);
		}
		if (!ns.fileExists("Formulas.exe", "home")) {
			hackingSteps.push([2500, 5e9]);
		}

		const next = hackingSteps.findIndex(a => a[0] >= ns.getHackingLevel());
		const cur = next - 1;
		if (next === -1 || cur === -1) {
			return money * useRatio;
		}

		const ratio = (ns.getHackingLevel() - hackingSteps[cur][0]) / (hackingSteps[next][0] - hackingSteps[cur][0]);
		const saveMoney = (hackingSteps[next][1] - hackingSteps[cur][1]) * ratio + hackingSteps[cur][1];
		ns.print(`Save money: ${saveMoney}`);

		return (money - saveMoney) * useRatio;
	}

	const actions = [
		{
			cost: () => {
				try {
					return ns.getUpgradeHomeRamCost();
				} catch (error) {
					return Infinity;
				}
			},
			upgrade: () => {
				if (ns.upgradeHomeRam()) {
					ns.print(`[home] Upgrade 'home' ram -> ${ns.getServerMaxRam("home")}GB`);
				}
			}
		},
		{
			cost: () => {
				try {
					return ns.getUpgradeHomeCoresCost();
				} catch (error) {
					return Infinity;
				}
			},
			upgrade: () => {
				if (ns.upgradeHomeCores()) {
					ns.print(`[home] Upgrade 'home' cores`);
				}
			}
		},
		{
			cost: () => {
				if (ns.hacknet.numNodes() >= maxNodes) {
					return Infinity;
				}
				return ns.hacknet.getPurchaseNodeCost();
			},
			upgrade: () => {
				const res = ns.hacknet.purchaseNode();
				ns.print("Purchased hacknet Node with index " + res);
			}
		}
	];

	/**
	 * @param {number} i
	 */
	function pushNodeActions(i) {
		actions.push(
			{
				cost: () => ns.hacknet.getLevelUpgradeCost(i, 10),
				upgrade: () => {
					ns.hacknet.upgradeLevel(i, 10);
					ns.print(`[${i}] Upgrade hacknet node Level`);
				}
			},
			{
				cost: () => ns.hacknet.getRamUpgradeCost(i, 2),
				upgrade: () => {
					ns.hacknet.upgradeRam(i, 2);
					ns.print(`[${i}] Upgrade hacknet node Ram`);
				}
			},
			{
				cost: () => ns.hacknet.getCoreUpgradeCost(i, 1),
				upgrade: () => {
					ns.hacknet.upgradeCore(i, 1);
					ns.print(`[${i}] Upgrade hacknet node Core`);
				}
			},
		)
	}

	let currentNodes = 0;
	function pushNodes() {
		const n = ns.hacknet.numNodes();
		for (let i = currentNodes; i < n; i++) {
			pushNodeActions(i);
		}
		currentNodes = n;
	}

	while (true) {
		pushNodes();
		actions.sort((a, b) => a.cost() - b.cost());

		const cost = actions[0].cost();
		if (Number.isFinite(cost)) {
			while (myMoney() < cost) {
				ns.print("Need $" + cost + " . Have $" + myMoney());
				await ns.sleep(1000);
			}
			actions[0].upgrade();
		}

		await ns.sleep(1000);
	}
}
