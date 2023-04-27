async function growTarget(ns, server) {
	//calculate how many threads are useful/possible and await grow() that many threads at server
	const gWaitTime = ns.getGrowTime(server.hostname);
	let gThreadsNeeded = Math.ceil(ns.growthAnalyze(server.hostname, (server.moneyMax / ns.getServerMoneyAvailable(server.hostname))) + 0.001);
	while (gThreadsNeeded > 0) {
		let gThreadsPossible = Math.floor((ns.getServerMaxRam('home') - ns.getServerUsedRam('home')) / ns.getScriptRam('weak.js'));
		if (gThreadsPossible >= gThreadsNeeded) {
			ns.print('running grow.js on home server with ' + gThreadsNeeded + ' threads at ' + server.hostname);
			ns.exec('grow.js', 'home', gThreadsNeeded, server.hostname);
			let duration = gWaitTime + 100;
			let expectedEnd = performance.now() + duration;
			let timeRemaining = expectedEnd - performance.now();
			while (timeRemaining > 0) {
				timeRemaining = expectedEnd - performance.now();
				ns.clearLog();
				ns.print('running grow.js on home server with ' + gThreadsNeeded + ' threads at ' + server.hostname);
				ns.print('this should be the only batch of grow()s needed.')
				ns.print('duration: ' + ns.tFormat(duration));
				ns.print('timeRemaining: ' + ns.tFormat(timeRemaining));
				await ns.sleep(100);
			}
			ns.print('Grow Complete.');
			gThreadsNeeded = 0;
		} else {
			ns.print('running grow.js on home server with ' + gThreadsPossible + ' threads at ' + server.hostname);
			ns.exec('grow.js', 'home', tThreadsPossible, server.hostname);
			let duration = gWaitTime + 100;
			let expectedEnd = performance.now() + duration;
			let timeRemaining = expectedEnd - performance.now();
			while (timeRemaining > 0) {
				timeRemaining = expectedEnd - performance.now();
				ns.clearLog();
				ns.print('running grow.js on home server with ' + gThreadsPossible + ' threads at ' + server.hostname);
				ns.print('growThreads needed after this round completes: ' + gThreadsNeeded - gThreadsPossible);
				ns.print('duration: ' + ns.tFormat(duration));
				ns.print('timeRemaining: ' + ns.tFormat(timeRemaining));
				await ns.sleep(100);
			}
			ns.print('Grow Complete.');
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
			let duration = wWaitTime + 100;
			let expectedEnd = performance.now() + duration;
			let timeRemaining = expectedEnd - performance.now();
			while (timeRemaining > 0) {
				timeRemaining = expectedEnd - performance.now();
				ns.clearLog();
				ns.print('running weak.js on home server with ' + wThreadsNeeded + ' threads at ' + server.hostname);
				ns.print('this should be the only batch of weaken()s needed.')
				ns.print('duration: ' + ns.tFormat(duration));
				ns.print('timeRemaining: ' + ns.tFormat(timeRemaining));
				await ns.sleep(100);
			}
			ns.print('Weaken Complete.');
			wThreadsNeeded = 0;
		} else {
			ns.print('running weak.js on home server with ' + wThreadsPossible + ' threads at ' + server.hostname);
			ns.exec('weak.js', 'home', wThreadsPossible, server.hostname);
			let duration = wWaitTime + 100;
			let expectedEnd = performance.now() + duration;
			let timeRemaining = expectedEnd - performance.now();
			while (timeRemaining > 0) {
				timeRemaining = expectedEnd - performance.now();
				ns.clearLog();
				ns.print('running weak.js on home server with ' + wThreadsNeeded + ' threads at ' + server.hostname);
				ns.print('weakThreads needed after this round completes: ' + wThreadsNeeded - wThreadsPossible)
				ns.print('duration: ' + ns.tFormat(duration));
				ns.print('timeRemaining: ' + ns.tFormat(timeRemaining));
				await ns.sleep(100);
			}
			ns.print('Weaken Complete')
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
	let curSec = ns.getServerSecurityLevel(server.hostname);
	let avaMon = ns.getServerMoneyAvailable(server.hostname);
	while (curSec > server.minDifficulty || avaMon < server.moneyMax) {
		if (curSec > server.minDifficulty) {
			await weakTarget(ns, server);
		}
		if (avaMon < server.moneyMax) {
			await growTarget(ns, server);
		}
		await ns.sleep(0);

		server = ns.getServer(target);
		curSec = ns.getServerSecurityLevel(server.hostname);
		avaMon = ns.getServerMoneyAvailable(server.hostname);
		wkTime = ns.getWeakenTime(server.hostname);
		gwTime = ns.getGrowTime(server.hostname);
	}
	ns.tprint('Target Prepped. Initiate ProtoBatch at the ready');

} //make sure grow.js, weak.js, and hack.js exist.
