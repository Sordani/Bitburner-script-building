async function growTarget(ns, server) {
	//calculate how many threads are useful/possible and await grow() that many threads at server
	const gWaitTime = ns.getGrowTime(server.hostname);
	let gThreadsNeeded = Math.ceil(ns.growthAnalyze(server.hostname, (server.moneyMax / ns.getServerMoneyAvailable(server.hostname))) + 0.001);
	while (gThreadsNeeded > 0) {
		let gThreadsPossible = Math.floor((ns.getServerMaxRam('home') - ns.getServerUsedRam('home')) / ns.getScriptRam('weak.js'));
		if (gThreadsPossible >= gThreadsNeeded) {
			ns.print('running grow.js on home server with ' + gThreadsNeeded + ' threads at ' + server.hostname);
			ns.exec('grow.js', 'home', gThreadsNeeded, server.hostname);
			gThreadsNeeded = 0;
		} else {
			ns.print('running grow.js on home server with ' + gThreadsPossible + ' threads at ' + server.hostname);
			ns.exec('grow.js', 'home', tThreadsPossible, server.hostname);
			await ns.sleep(gWaitTime + 200); 
			gThreadsNeeded = gThreadsNeeded - gThreadsPossible;
		}
	}	
}

async function weakTarget(ns, server) {
	///calculate how many threads are useful/possible and await weaken() that many threads at server
	const wWaitTime = ns.getWeakenTime(server.hostname);
	let wThreadsNeeded = Math.ceil((ns.getServerSecurityLevel(server.hostname) - server.minDifficulty) / ns.weakenAnalyze(1) + 0.001);
	while (wThreadsNeeded > 0) {
		let wThreadsPossible = Math.floor((ns.getServerMaxRam('home') - ns.getServerUsedRam('home')) / ns.getScriptRam('weak.js'));
		if (wThreadsPossible >= wThreadsNeeded) {
			ns.print('running weak.js on home server with ' + wThreadsNeeded + ' threads at ' + server.hostname);
			ns.exec('weak.js', 'home', wThreadsNeeded, server.hostname);
			wThreadsNeeded = 0;
		} else {
			ns.print('running weak.js on home server with ' + wThreadsPossible + ' threads at ' + server.hostname);
			ns.exec('weak.js', 'home', wThreadsPossible, server.hostname);
			await ns.sleep(wWaitTime + 200);
			wThreadsNeeded = wThreadsNeeded - wThreadsPossible;
		}
	}
}

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.enableLog("exec");
	ns.tail();
	const target = ns.args[0];
	let server = ns.getServer(target);
	let hservr = ns.getServer('home');
	let curSec = ns.getServerSecurityLevel(server.hostname);
	let avaMon = ns.getServerMoneyAvailable(server.hostname);
	let wkTime = ns.getWeakenTime(server.hostname);
	let gwTime = ns.getGrowTime(server.hostname);
	while (curSec > server.minDifficulty || avaMon < server.moneyMax) {
		ns.clearLog();
		ns.print('server: ' + server.hostname);
		ns.print('Security: ' + curSec);
		ns.print('MinSecurity (Want): ' + server.minDifficulty);
		ns.print('WeakenTime: ' + ns.tFormat(wkTime, true));
		ns.print('MoneyAvailable: ' + ns.formatNumber(avaMon));
		ns.print('MoneyMax (Want): ' + ns.formatNumber(server.moneyMax));
		ns.print('GrowTime: ' + ns.tFormat(gwTime, true));
		let tCount = Math.floor((ns.getServerMaxRam('home') - ns.getServerUsedRam('home')) / ns.getScriptRam('weak.js'));
		if (curSec > server.minDifficulty) {
			await weakTarget(ns, server);
		}
		if (avaMon < server.moneyMax) {
			await growTarget(ns, server);
		}
		await ns.sleep(200);
		server = ns.getServer(target);
		curSec = ns.getServerSecurityLevel(server.hostname);
		avaMon = ns.getServerMoneyAvailable(server.hostname);
		wkTime = ns.getWeakenTime(server.hostname);
		gwTime = ns.getGrowTime(server.hostname);
	}
	ns.print('Target Prepped. Initiate ProtoBatch at the ready');

}
