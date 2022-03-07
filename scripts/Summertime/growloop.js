function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array
}
/** @param {NS} ns **/
export async function main(ns) {
	let args = ns.flags([
		['name', ''],
	])
	let hosts = args._.slice(0)
	if (hosts.length === 0)
		ns.exit()
	shuffleArray(hosts)
	while (true)
		for (const host of hosts)
			await ns.grow(host)
}