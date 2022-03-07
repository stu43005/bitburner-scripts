function allhosts(ns) {
	let hosts = ['home'];
	for (const host of hosts)
		for (const newhost of ns.scan(host))
			if (!hosts.includes(newhost))
				hosts.push(newhost)
	return hosts
}

/** @param {NS} ns **/
export async function main(ns) {
	const player = ns.getPlayer()
	const hosts = allhosts(ns)
	for (const host of hosts) {
		ns.scriptKill('hackloop.js', host)
	}
	const servers = hosts.map(h => ns.getServer(h))


	const sources = servers.slice(1).filter(s => s.hasAdminRights)
	const targets = sources.filter(s => s.requiredHackingSkill <= player.hacking)

	for (const source of sources) {
		await ns.scp('hackloop.js', 'home', source.hostname)
		const freeRam = source.maxRam - source.ramUsed;
		const neededRam = ns.getScriptRam('hackloop.js', source.hostname)
		const threads = Math.floor(freeRam / neededRam)
		if (threads > 0)
			ns.exec('hackloop.js', source.hostname, threads, ...targets.map(s => s.hostname))
	}
}