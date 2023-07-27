export function updatePServRams(ns) {
	return ns.scan("home").filter((server) => server.includes('pserv-')).map((server) => ({ name: server, ram: ns.getServerMaxRam(server) }));
}
/** @param {NS} ns */
export async function main(ns) {
	const startRam = 8;
	let numOfPServs = updatePServRams(ns).length;
	let i = numOfPServs;
	let money = ns.getServerMoneyAvailable('home');
	while (numOfPServs < ns.getPurchasedServerLimit()) {
		await ns.sleep(0);
		money = ns.getServerMoneyAvailable('home');
		if (money >= ns.getPurchasedServerCost(startRam)) {
			ns.purchaseServer('pserv-' + i, startRam);
			numOfPServs = updatePServRams(ns).length;
			i++
		}
	}
	ns.exec("serverfarm.js", "home", 1, )
}
