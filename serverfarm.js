/** @param {NS} ns */
function updatePServRams(ns) {
	/*let pServList = [];
	let scanList = ns.scan('home');
	for (let i = 0; i < scanList.length; i++) {
		if (!scanList[i].includes('pserv-')) continue;
		pServList.push(scanList[i]);
	}
	return pServList.map((server) => ({ name: server, ram: ns.getPurchasedServerMaxRam(server)})); */
	//the below line is a chained line of all the code above.
	return ns.scan("home").filter((server) => server.includes('pserv-')).map((server) => ({ name: server, ram: ns.getServerMaxRam(server) }));

}

/** @param {NS} ns */
function getSmallestRamPServer(pServList) {
	return pServList.sort((a, b) => a.ram - b.ram)[0];
}

/** @param {NS} ns */
function upgradePserv(ns, pserver) {
	ns.killall(pserver.name);
	ns.upgradePurchasedServer(pserver.name, pserver.ram * 2);
}

/** @param {NS} ns */
function printStuff(ns) {
	ns.clearLog();
	ns.resizeTail(200, 250);
	ns.moveTail(1400, 600);
	const pservers = updatePServRams(ns);
	const smallestServer = getSmallestRamPServer(pservers)
	const cost = ns.getPurchasedServerUpgradeCost(smallestServer.name, smallestServer.ram * 2);
	ns.print("Server Count: " + pservers.length);
	ns.print("Upgrade Target: " + smallestServer.name);
	ns.print("ram from: " + smallestServer.ram);
	ns.print("ram to: " + smallestServer.ram * 2);
	ns.print("Cost: " + ns.formatNumber(cost, 3));

}


/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();
	let pservList = updatePServRams(ns);
	const maxRam = ns.getPurchasedServerMaxRam();
	let lowestRamServ = getSmallestRamPServer(pservList);

	while (lowestRamServ.ram < maxRam) {
		await ns.sleep(30);
		let money = ns.getServerMoneyAvailable('home');
		if (money < ns.getPurchasedServerUpgradeCost(lowestRamServ.name, lowestRamServ.ram * 2)) continue;
		upgradePserv(ns, lowestRamServ);
		pservList = updatePServRams(ns);
		lowestRamServ = getSmallestRamPServer(pservList);
		printStuff(ns);
	}
}
