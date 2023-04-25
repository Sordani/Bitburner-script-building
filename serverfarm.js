async function purchasePServ(ns, virus) {
	const startRam = 8;
	let numOfPServs = updatePServRams(ns).length;
	let i = numOfPServs;
	while (numOfPServs < ns.getPurchasedServerLimit()) {
		await ns.sleep(10000);
		let money = ns.getServerMoneyAvailable('home');
		if (money < ns.getPurchasedServerCost(startRam)) continue;
		ns.purchaseServer('pserv-' + i, startRam);
		ns.print('Purchased pserv-' + i + ' starting at 8 gbs');
		ns.scp(virus, 'pserv-' + i);
		numOfPServs = updatePServRams(ns).length;
		i++
	}
}

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

function getSmallestRamPServer(ns, pServList) {
	return pServList.sort((a, b) => a.ram - b.ram)[0];
}

function upgradePserv(ns, virus, pserver) {
	ns.print('virus');
	ns.print(virus);
	ns.print('pserver');
	ns.print(pserver);
	ns.scriptKill(virus, pserver.name);
	ns.upgradePurchasedServer(pserver.name, pserver.ram * 2);
	ns.print('Upgraded ' + pserver.name + ' to ' + pserver.ram * 2 + ' gbs.');
	ns.scp(virus, pserver.name);
}


/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();
	const virus = 'early-hack-template.js'
	let pservList = updatePServRams(ns);
	const pservLimit = ns.getPurchasedServerLimit();
	const maxRam = ns.getPurchasedServerMaxRam();

	if (pservList.length < pservLimit) {
		await purchasePServ(ns, virus);
	}

	pservList = updatePServRams(ns);
	let lowestRamServ = getSmallestRamPServer(ns, pservList);

	while (lowestRamServ.ram < maxRam) {
		await ns.sleep(1000);
		let money = ns.getServerMoneyAvailable('home');
		if (money < ns.getPurchasedServerUpgradeCost(lowestRamServ.name, lowestRamServ.ram * 2)) continue;
		upgradePserv(ns, virus, lowestRamServ);
		pservList = updatePServRams(ns);
		lowestRamServ = getSmallestRamPServer(ns, pservList);
		ns.print('next server to upgrade is ' + lowestRamServ.name);
	}
}
