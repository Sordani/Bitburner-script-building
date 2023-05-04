/** @param {NS} ns */
export async function main(ns) {
	ns.print('Function library. no functions to run on its own.');
}

/** @param {NS} ns */
//function to take a server hostname, an array, and a value defined with minBlockSize and maxBlockSize
//calculates available ram. will dynamically change based on needs of batcher.
//pVal is an object consisting of totalThreads, target, maxBlockSize, and minBlockSize
export function ramCount(ns, server, serverRam, pVal) {
	if (ns.hasRootAccess(server)) {
		const ram = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
		if (ram >= 1.60) {
			const block = { server: server, ram: ram, used: false };
			serverRam.push(block);
			if (ram < pVal.minBlockSize) pVal.minBlockSize = ram;
			if (ram > pVal.maxBlockSize) pVal.maxBlockSize = ram;
			pVal.totalThreads += Math.floor(ram / 1.75);
			return true;
		}
	}
}

/** @param {NS} ns */
// Solve for number of growth threads required to get from money_lo to money_hi
// base is ns.formulas.hacking.growPercent(serverObject, 1, playerObject, cores)
export function solveGrow(base, money_lo, money_hi) {
	if (money_lo >= money_hi) { return 0; }

	let threads = 1000;
	let prev = threads;
	for (let i = 0; i < 30; ++i) {
		let factor = money_hi / Math.min(money_lo + threads, money_hi - 1);
		threads = Math.log(factor) / Math.log(base);
		if (Math.ceil(threads) == Math.ceil(prev)) { break; }
		prev = threads;
	}

	return Math.ceil(Math.max(threads, prev, 0));
}

/** @param {NS} ns */
//function to simple return true or false if a target is at minsecurity and maxmoney. 'prepped'
export function isPrepped(ns, host) {
	return ns.getServerSecurityLevel(host) <= ns.getServerMinSecurityLevel(host) && ns.getServerMoneyAvailable(host) >= ns.getServerMaxMoney(host);
}

/** @param {NS} ns */
//function to check if each program that open ports exists.
export function countPrograms(ns) {
	const fileArray = ["brutessh.exe", "ftpcrack.exe", "relaysmtp.exe", "httpworm.exe", "sqlinject.exe"];
	let fileCount = 0;
	for (let i = 0; i < fileArray.length;) {
		fileCount += ns.fileExists(fileArray[i], 'home');
		i++;
	}
	return fileCount;
}

/** @param {NS} ns */
//function that tests the ports required to hack and the hacking level required to access.
//returns false if either tests aren't passed, returns true otherwise.
//requires countPrograms
export function canHack(ns, server) {
	if (ns.getServerRequiredHackingLevel(server) > ns.getHackingLevel()) return false;
	if (ns.getServerNumPortsRequired(server) > countPrograms(ns)) return false;
	return true;
}

/** @param {NS} ns */
//function to call a script that opens all the ports on the parameter server.
export async function breakingAndEntering(ns, server) {
	//script that contains logic to run all port opening programs and nuke.exe.
	const portScript = 'portopener.js'
	ns.exec(portScript, 'home', 1, server);
	await ns.sleep(100);
	ns.print('root access gained on ' + server);
}

/** @param {NS} ns */
// copied this straight from #early-game pinned messages in the bitburner discord. posted by xsinx#1018
// Returns a weight that can be used to sort servers by hack desirability
// requires countPrograms
export function Weight(ns, server) {
	if (!server) return 0;
	if (server.startsWith('hacknet-node')) return 0;
	let player = ns.getPlayer();
	let so = ns.getServer(server);
	so.hackDifficulty = so.minDifficulty;
	if (so.requiredHackingSkill > ns.getHackingLevel()) { return 0; }
	//the following line of code was added. requires countPrograms.
	if (ns.getServerNumPortsRequired(server) > countPrograms(ns)) { return 0; }
	let weight = so.moneyMax / so.minDifficulty;
	if (ns.fileExists('Formulas.exe')) {
		weight = so.moneyMax / ns.formulas.hacking.weakenTime(so, player) * ns.formulas.hacking.hackChance(so, player);
	}
	else
		if (so.requiredHackingSkill > ns.getHackingLevel())
			return 0;
	return weight;
}

/** @param {NS} ns */
//function to obtain the full list of servers in the game.
//referred to a depth first searching.
export function getServerList(ns) {
	let found = [];
	let unscanned = ['home'];

	while (unscanned.length > 0) {
		let server = unscanned.pop();
		let neighbors = ns.scan(server);
		for (let i = 0; i < neighbors.length; i++) {
			if (found.includes(neighbors[i])) continue;
			found.push(neighbors[i]);
			unscanned.push(neighbors[i]);
		}

	}
	return found;
}

/** @param {NS} ns */
//function to grab list of servers (results from getServerList function) and assigns 
//hackability weight to them. requires Weight function.
export function updateTarget(ns) {
	return getServerList(ns).map((server) => ({ name: server, score: Weight(ns, server) }))
}

/** @param {NS} ns */
//function that requires the results of updateTarget() and parses 
// the information to find the highest weighted server name.
export function getBestTarget(ns, serverList) {
	return serverList.sort((a, b) => b.score - a.score)[0]
}

/** @param {NS} ns */
//turning the prep script into a function to be exported to the batcher to prep targets as a matter of course
//code bloated by working progress log.
//code not optimized to take advantage of any server besides 'home'
//code not optimized beyond "weaken to minimum security only, then grow with accompanying weakens to mitigate security effects of grow"
export async function prepTarget(ns, paramServer) {
	let server = ns.getServer(paramServer);
	let curSec = ns.getServerSecurityLevel(server.hostname);
	let avaMon = ns.getServerMoneyAvailable(server.hostname);
	const player = ns.getPlayer();
	const gWaitTime = ns.getGrowTime(server.hostname);
	const wWaitTime = ns.getWeakenTime(server.hostname);
	while (curSec > server.minDifficulty || avaMon < server.moneyMax) {
		if (curSec > server.minDifficulty) {
			let wThreadsNeeded = Math.ceil((ns.getServerSecurityLevel(server.hostname) - server.minDifficulty) / ns.weakenAnalyze(1) + 0.001);
			while (wThreadsNeeded > 0) {
				let wThreadsPossible = Math.max(Math.floor((ns.getServerMaxRam('home') - (ns.getServerUsedRam('home') + 4)) / ns.getScriptRam('weak.js')), 1);
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
						ns.print('this should be the only batch of weaken()s needed.');
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
						ns.print('weakThreads needed after this round completes: ' + wThreadsNeeded - wThreadsPossible);
						ns.print('duration: ' + ns.tFormat(duration));
						ns.print('timeRemaining: ' + ns.tFormat(timeRemaining));
						await ns.sleep(100);
					}
					ns.print('Weaken Complete')
					wThreadsNeeded = wThreadsNeeded - wThreadsPossible;
				}
			}
		}
		if (avaMon < server.moneyMax) {
			let gThreadsNeeded = ns.fileExists('formulas.exe') ? ns.formulas.hacking.growThreads(server, player, server.moneyMax) : Math.ceil(ns.growthAnalyze(server.hostname, (server.moneyMax / server.moneyAvailable)) + 0.001);
			while (gThreadsNeeded > 0) {
				let gThreadsPossible = Math.floor((ns.getServerMaxRam('home') - (ns.getServerUsedRam('home') + 4)) / ns.getScriptRam('grow.js'));
				let wThreads = Math.ceil((gThreadsPossible * 0.004) / 0.05);
				let gThreads = gThreadsPossible - wThreads;
				if (gThreads >= gThreadsNeeded) {
					ns.exec('grow.js', 'home', gThreads, server.hostname);
					ns.exec('weak.js', 'home', wThreads, server.hostname);
					let durationw = wWaitTime;
					let durationg = gWaitTime;
					let expectedEndw = performance.now() + durationw;
					let expectedEndg = performance.now() + durationg;
					let timeRemainingw = expectedEndw - performance.now();
					let timeRemainingg = expectedEndg - performance.now();
					while (timeRemainingw > 0) {
						timeRemainingw = expectedEndw - performance.now();
						timeRemainingg = expectedEndg - performance.now();
						ns.clearLog();
						ns.print('running grow.js on home server with ' + gThreads + ' threads at ' + server.hostname);
						ns.print('this should be the only batch of grows needed.');
						ns.print('grow time: ' + ns.tFormat(durationg));
						ns.print('grow time remaining: ' + ns.tFormat(timeRemainingg));
						ns.print('countering weaken will take: ' + ns.tFormat(durationw));
						ns.print('weaken time remaining: ' + ns.tFormat(timeRemainingw));
						await ns.sleep(100);
					}
					ns.print('Grow Complete.');
					gThreadsNeeded = 0;
				} else {
					ns.print('running grow.js on home server with ' + gThreads + ' threads at ' + server.hostname);
					ns.exec('grow.js', 'home', gThreads, server.hostname);
					ns.exec('weak.js', 'home', wThreads, server.hostname);
					let durationw = wWaitTime;
					let durationg = gWaitTime;
					let expectedEndw = performance.now() + durationw;
					let expectedEndg = performance.now() + durationg;
					let timeRemainingw = expectedEndw - performance.now();
					let timeRemainingg = expectedEndg - performance.now();
					while (timeRemainingw > 0) {
						timeRemainingw = expectedEndw - performance.now();
						timeRemainingg = expectedEndg - performance.now();
						ns.clearLog();
						ns.print('running grow.js on home server with ' + gThreads + ' threads at ' + server.hostname);
						ns.print('growThreads needed after this round completes: ' + (gThreadsNeeded - gThreads));
						ns.print('grow: ' + ns.tFormat(durationg));
						ns.print('grow completing in: ' + ns.tFormat(timeRemainingg))
						ns.print('countering weaken will take: ' + ns.tFormat(durationw));
						ns.print('weaken: ' + ns.tFormat(timeRemainingw));
						await ns.sleep(100);
					}
					ns.print('Grow Complete.');
					gThreadsNeeded = gThreadsNeeded - gThreadsPossible;
				}
			}
		}
		await ns.sleep(0);

		server = ns.getServer(target);
		curSec = ns.getServerSecurityLevel(server.hostname);
		avaMon = ns.getServerMoneyAvailable(server.hostname);
	}
}
