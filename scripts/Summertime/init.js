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
	const targets = allhosts(ns)
		.slice(1)
		.map(h => ns.getServer(h))
		.filter(s => s.hasAdminRights)
		.filter(s => s.requiredHackingSkill <= player.hacking)
	ns.scriptKill('growloop.js', 'home')
	ns.scriptKill('secloop.js', 'home')
	let X = 0
	while (X++ < 8) {
		ns.exec('growloop.js', 'home', 4, '--name', X, ...targets.map(h => h.hostname))
		ns.exec('secloop.js', 'home', 4, '--name', X, ...targets.map(h => h.hostname))
	}
}