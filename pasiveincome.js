/** @param {NS} ns */
export function printStuff(ns) {
	let production = 0;
	for (let i = 0; i < ns.hacknet.numNodes(); i++) {
		const node = ns.hacknet.getNodeStats(i);
		production += node.production
	}
	ns.clearLog();
	ns.resizeTail(200, 100);
	ns.moveTail(1400, 500);
	ns.print(ns.hacknet.numNodes() + " out of 23 Nodes");
	ns.print("Prod: $" + ns.formatNumber(production, 3, 1000, true) + " p/s");
}

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();
	while (ns.hacknet.numNodes() === 0) {
		if (ns.hacknet.getPurchaseNodeCost() < ns.getServerMoneyAvailable("home")) { ns.hacknet.purchaseNode(); }
		await ns.sleep(0);
	}
	printStuff(ns);
	while (ns.hacknet.numNodes() > 0) {
		if (ns.hacknet.numNodes() == 23 && ns.hacknet.getNodeStats(22).level == 200 && ns.hacknet.getNodeStats(22).cores == 16 && ns.hacknet.getNodeStats(22).ram == 64) { ns.exit(); }
		let newNodeCost = ns.hacknet.getPurchaseNodeCost();
		let printcheck = false;
		for (let i = 0; i < ns.hacknet.numNodes(); i++) {
			const node = ns.hacknet.getNodeStats(i);
			if (ns.hacknet.getLevelUpgradeCost(i) < newNodeCost && node.level < 200 && ns.hacknet.getLevelUpgradeCost(i) < ns.getServerMoneyAvailable("home")) {
				ns.hacknet.upgradeLevel(i);
				printcheck = true;
				await ns.sleep(0);
			}
			if (ns.hacknet.getRamUpgradeCost(i) < newNodeCost && ns.hacknet.getRamUpgradeCost(i) < ns.getServerMoneyAvailable("home")) {
				ns.hacknet.upgradeRam(i);
				printcheck = true;
				await ns.sleep(0);
			}
			if (ns.hacknet.getCoreUpgradeCost(i) < newNodeCost && ns.hacknet.getCoreUpgradeCost(i) < ns.getServerMoneyAvailable("home")) {
				ns.hacknet.upgradeCore(i);
				printcheck = true;
				await ns.sleep(0);
			}
			if (ns.hacknet.getCacheUpgradeCost(i) < newNodeCost && ns.hacknet.getCacheUpgradeCost(i) < ns.getServerMoneyAvailable("home")) {
				ns.hacknet.upgradeCache(i);
				printcheck = true;
				await ns.sleep(0);
			}
		}
		if (newNodeCost < ns.getServerMoneyAvailable("home") && ns.hacknet.numNodes() < 23) {
			ns.hacknet.purchaseNode();
			printcheck = true;
		}
		if (printcheck) { printStuff(ns); }
		await ns.sleep(0);
	}

}
