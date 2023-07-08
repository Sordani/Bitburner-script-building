/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("getServerMoneyAvailable");
	while (ns.getServerMaxRam("home") < Math.pow(2, 30)) {
		if (ns.getServerMoneyAvailable('home') > ns.singularity.getUpgradeHomeRamCost()) {
			ns.singularity.upgradeHomeRam();
		}
		await ns.sleep(30000);
	}
}
