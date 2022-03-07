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
	const openers = {
		ftp: ns.fileExists('FTPCrack.exe', 'home'),
		http: ns.fileExists('HTTPWorm.exe', 'home'),
		smtp: ns.fileExists('relaySMTP.exe', 'home'),
		sql: ns.fileExists('SQLInject.exe', 'home'),
		ssh: ns.fileExists('BruteSSH.exe', 'home'),
	}
	const numOpenPorts = Object.values(openers).reduce((a, b) => a + b)
	const rootable = allhosts(ns)
		.slice(1)
		.map(h => ns.getServer(h))
		.filter(s => !s.hasAdminRights)
		.filter(s => s.numOpenPortsRequired <= numOpenPorts)

	for (const server of rootable) {
		if (openers.ftp)
			ns.ftpcrack(server.hostname)
		if (openers.http)
			ns.httpworm(server.hostname)
		if (openers.smtp)
			ns.relaysmtp(server.hostname)
		if (openers.sql)
			ns.sqlinject(server.hostname)
		if (openers.ssh)
			ns.brutessh(server.hostname)
		ns.nuke(server.hostname)
	}
}