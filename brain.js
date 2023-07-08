/** @param {NS} ns */
export async function main(ns) {

	ns.disableLog('ALL');
	const firstScripts = ["serverpurchase.js", "passiveincome.js", "expmode.js"]; //,"steve.js"
	const checkers = ["corpchecker.js", "steve.js", "singchecker.js", "batchchecker.js"];
	for (const script of firstScripts) {
		if (!ns.isRunning(script, "home")) { ns.exec(script, "home"); }
	}
	while (true) {
		if (!ns.isRunning("homeramupgrade.js", "pserv-0")) { ns.scp("homeramupgrade.js", "pserv-0", "home"); ns.exec("homeramupgrade.js", "pserv-0"); }
		for (const checker of checkers){
			ns.exec(checker, "home");
			await ns.sleep(1000);
		}
		await ns.sleep(15000);
	}

}
