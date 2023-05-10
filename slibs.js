/** @param {NS} ns */
export async function main(ns) {
	ns.print('Function library. Keep this installed. No delete. No disassemble.');
}

/** @param {NS} ns */
export function optimizeShotgun(ns, ramNet, values) {
	const wTime = ns.getWeakenTime(values.optimalTarget);
	let maxMoney = ns.getServerMaxMoney(values.optimalTarget);
	let greed = 0.001;
	let bestIncome = 0;
	while (greed <= 0.02) {
		// Simulating all of the threads instead of just growth.
		const amount = maxMoney * greed;
		const hThreads = Math.max(Math.min(Math.floor(ns.hackAnalyzeThreads(values.optimalTarget, amount)), Math.floor(ramNet.slice(-2)[0].ram / 1.7)), 1);
		const tAmount = ns.hackAnalyze(values.optimalTarget) * hThreads;
		const gThreads = Math.ceil(ns.growthAnalyze(values.optimalTarget, maxMoney / (maxMoney - (maxMoney * tAmount))) * 1.01);
		const wThreads1 = Math.max(Math.ceil(hThreads * 0.002 / 0.05), 1);
		const wThreads2 = Math.max(Math.ceil(gThreads * 0.004 / 0.05), 1);
		const batchSize = hThreads * 1.7 + (gThreads + wThreads1 + wThreads2) * 1.75;
		const batchCount = Math.floor(values.totalThreads * 1.75 / batchSize);
		// This formula is where the magic happens. Trying to balance higher income over longer times.
		const income = tAmount * maxMoney * batchCount / (values.spacer * 4 * batchCount + wTime + values.buffer);
		// Adjusting values. No need to return anything since maps are passed by reference.
		if (income > bestIncome) {
			bestIncome = income;
			values.bestIncome = income;
			values.greed = greed;
			values.depth = batchCount;
		try { 
			values.hThreads = hThreads;
			values.gThreads = gThreads;
			values.wThreads1 = wThreads1;
			values.wThreads2 = wThreads2;
			values.batchSize = batchSize;
		}
		catch {}
		}
		greed += 0.001;
	}
}

/** @param {NS} ns */
//ramNetwork is the supplied array from buildramNetwork(), values is an object of values, and shells is an empty array.
export function loadShotgunShells(ns, ramNetwork, values, shells) {
	for (const block of ramNetwork) {
		if (block.ram < values.batchSize) continue;
		block.batchSpace = Math.floor(block.ram / values.batchSize);
		shells.push(block);
		values.shots += block.batchSpace
		values.shells++
	}
}

/** @param {NS} ns */
//function to take a server hostname, an array, and a value defined with minBlockSize and maxBlockSize
//calculates available ram. will dynamically change based on needs of batcher.
//paramVal is an object consisting of totalThreads, target, maxBlockSize, and minBlockSize
//ramNetwork starts as an empty array and is filled with server nams, rams, and used.
export function buildramNetwork(ns, ramNetwork, paramVal) {
	let serverlist = getServerList(ns);
	for (let i = 0; i < serverlist.length; i++) {
		if (ns.hasRootAccess(serverlist[i])) {
			const ram = ns.getServerMaxRam(serverlist[i]); //- ns.getServerUsedRam(serverlist[i]);
			if (ram >= 1.60) {
				const block = { server: serverlist[i], ram: ram, batchSpace: 0, used: false };
				ramNetwork.push(block);
				if (ram < paramVal.minBlockSize) paramVal.minBlockSize = ram;
				if (ram > paramVal.maxBlockSize) paramVal.maxBlockSize = ram;
				paramVal.totalThreads += Math.floor(ram / 1.75);
			}
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
//function to take the list of servers, check if we have root access to them, and if not, gain it.
//requires countPrograms
export async function getAccess(ns, serverList) {
	const portScript = 'portopener.js';
	const filecount = countPrograms(ns);
	for (let i = 0; i < serverList.length; i++) {
		if (ns.hasRootAccess(serverList[i])) continue;
		if (serverList[i] == 'home') continue;
		if (serverList[i].includes('pserv')) continue;
		if (filecount < ns.getServerNumPortsRequired(serverList[i])) continue;
		ns.exec(portScript, 'home', 1, serverList[i]);
		await ns.sleep(100);
	}
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
	return serverList.sort((a, b) => b.score - a.score)[0].name
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
			let wThreadsNeeded = Math.ceil((ns.getServerSecurityLevel(paramServer) - server.minDifficulty) / ns.weakenAnalyze(1) + 0.001);
			while (wThreadsNeeded > 0) {
				let wThreadsPossible = Math.max(Math.floor((ns.getServerMaxRam('home') - (ns.getServerUsedRam('home') + 4)) / ns.getScriptRam('weak.js')), 1);
				if (wThreadsPossible >= wThreadsNeeded) {
					ns.print('running weakprep.js on home server with ' + wThreadsNeeded + ' threads at ' + paramServer);
					ns.exec('weakprep.js', 'home', wThreadsNeeded, paramServer);
					let duration = wWaitTime + 100;
					let expectedEnd = performance.now() + duration;
					let timeRemaining = expectedEnd - performance.now();
					while (timeRemaining > 0) {
						timeRemaining = expectedEnd - performance.now();
						ns.clearLog();
						ns.print('prepping server. any problems at this time are in the prep function.');
						ns.print('weakprep.js was run with the following parameters: "home", ' + wThreadsNeeded + ' and ' + paramServer);
						ns.print('running weak.js on home server with ' + wThreadsNeeded + ' threads at ' + server.hostname);
						ns.print('this should be the only batch of weaken()s needed.');
						ns.print('duration: ' + ns.tFormat(duration));
						ns.print('timeRemaining: ' + ns.tFormat(timeRemaining));
						await ns.sleep(1000);
					}
					ns.print('Weaken Complete.');
					wThreadsNeeded = 0;
				} else {
					ns.print('running weakprep.js on home server with ' + wThreadsPossible + ' threads at ' + server.hostname);
					ns.exec('weakprep.js', 'home', wThreadsPossible, paramServer);
					let duration = wWaitTime + 100;
					let expectedEnd = performance.now() + duration;
					let timeRemaining = expectedEnd - performance.now();
					while (timeRemaining > 0) {
						timeRemaining = expectedEnd - performance.now();
						ns.clearLog();
						ns.print('prepping server. any problems at this time are in the prep function.');
						ns.print('weak.js was run with the following parameters: "home", ' + wThreadsPossible + ' and ' + paramServer);
						ns.print('running weak.js on home server with ' + wThreadsNeeded + ' threads at ' + server.hostname);
						ns.print('weakThreads needed after this round completes: ' + wThreadsNeeded - wThreadsPossible);
						ns.print('duration: ' + ns.tFormat(duration));
						ns.print('timeRemaining: ' + ns.tFormat(timeRemaining));
						await ns.sleep(1000);
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
					ns.exec('growprep.js', 'home', gThreads, paramServer);
					ns.exec('weakprep.js', 'home', wThreads, paramServer);
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
						ns.print('prepping server. any problems at this time are in the prep function.');
						ns.print('running growprep.js on home server with ' + gThreads + ' threads at ' + paramServer);
						ns.print('this should be the only batch of grows needed.');
						ns.print('grow time: ' + ns.tFormat(durationg));
						ns.print('grow time remaining: ' + ns.tFormat(timeRemainingg));
						ns.print('countering weaken will take: ' + ns.tFormat(durationw));
						ns.print('weaken time remaining: ' + ns.tFormat(timeRemainingw));
						await ns.sleep(1000);
					}
					ns.print('Grow Complete.');
					gThreadsNeeded = 0;
				} else {
					ns.print('running growprep.js on home server with ' + gThreads + ' threads at ' + server.hostname);
					ns.exec('growprep.js', 'home', gThreads, server.hostname);
					ns.exec('weakprep.js', 'home', wThreads, server.hostname);
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
						ns.print('prepping server. any problems at this time are in the prep function.');
						ns.print('running growprep.js on home server with ' + gThreads + ' threads at ' + paramServer);
						ns.print('growThreads needed after this round completes: ' + (gThreadsNeeded - gThreads));
						ns.print('grow: ' + ns.tFormat(durationg));
						ns.print('grow completing in: ' + ns.tFormat(timeRemainingg))
						ns.print('countering weaken will take: ' + ns.tFormat(durationw));
						ns.print('weaken: ' + ns.tFormat(timeRemainingw));
						await ns.sleep(1000);
					}
					ns.print('Grow Complete.');
					gThreadsNeeded = gThreadsNeeded - gThreadsPossible;
				}
			}
		}
		await ns.sleep(0);

		server = ns.getServer(paramServer);
		curSec = ns.getServerSecurityLevel(server.hostname);
		avaMon = ns.getServerMoneyAvailable(server.hostname);
	}
}

//don't use this. copied from bitburner discord from jakob'#6443. this requires singularity.
//figure out what that is before looking/modifying/trying this.
/*
export async function installBackdoors(ns) {
	const allServer = ["home"]
	for (const server of allServer) {
		ns.scan(server).forEach((found) => allServer.includes(found) ? null : allServer.push(found))
	}
	for (const server of allServer) {
		if (ns.getServer(server).backdoorInstalled) continue;
		const path = [server]
		while (!ns.getServer(path[0]).backdoorInstalled) {
			path.unshift(ns.scan(path[0])[0])
		}
		path.forEach((server) => ns.singularity.connect(server))
		await ns.singularity.installBackdoor() // or flip flop with await nextWrite to run a new script that backdoors
	}
	ns.singularity.connect("home")
}
*/

// The recursive server navigation algorithm.
/** @param {NS} ns */
export function getServers(ns, lambdaCondition = (ns, server) => true, hostname = "home", servers = [], visited = []) {
	if (visited.includes(hostname)) return;
	visited.push(hostname);
	if (lambdaCondition(ns, hostname)) servers.push(hostname);
	const connectedNodes = ns.scan(hostname);
	if (hostname !== "home") connectedNodes.shift();
	for (const node of connectedNodes) getServers(ns, lambdaCondition, node, servers, visited);
	return servers;
}

// Custom predicates
/** @param {NS} ns */
export function checkTarget(ns, server, pVal) {
	if (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel() / 2) {
		const previousScore = ns.getServerMaxMoney(pVal.target) / ns.getServerMinSecurityLevel(pVal.target);
		const currentScore = ns.getServerMaxMoney(server) / ns.getServerMinSecurityLevel(server);
		if (currentScore > previousScore) pVal.target = server;
	}
}

/** @param {NS} ns */
export function buildRamNet(ns, server, pRam, pVal) {
	if (ns.hasRootAccess(server)) {
		const ram = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
		if (ram >= 1.60) {
			const block = { server: server, ram: ram, used: false };
			pRam.push(block);
			if (ram < pVal.minBlockSize) pVal.minBlockSize = ram;
			if (ram > pVal.maxBlockSize) pVal.maxBlockSize = ram;
			pVal.totalThreads += Math.floor(ram / 1.75);
			return true;
		}
	}
}

/** @param {NS} ns */
export async function expMode(ns) {
	const portScript = 'portopener.js';
	if (ns.getHackingLevel() > 100) ns.print('Hacking level above necessary baseline. Make money, Champ.');
	ns.exec(portScript, 'home', 1, 'joesguns');
	const ramNetwork = [];
	const values = {
		totalThreads: 0,
		optimalTarget: 'joesguns',
		maxBlockSize: 0,
		minBlockSize: Infinity
	}
	const wkTime = ns.getWeakenTime(values.optimalTarget);
	const hkTime = wkTime / 4;
	const gwTime = hkTime * 3.2;
	buildramNetwork(ns, ramNetwork, values);
	const dataPort = ns.getPortHandle(ns.pid);
	dataPort.clear();
	while (ns.getServerMinSecurityLevel(values.optimalTarget) < ns.getServerSecurityLevel(values.optimalTarget)) {
		for (const block of ramNetwork) {
			const cost = ns.getScriptRam('protoweak.js');
			if (block.ram / cost >= 1 && !block.used) {
				const threads = Math.floor(block.ram / cost);
				const metrics = { target: values.optimalTarget, job: 'weaken', delay: 0, port: ns.pid, portwrite: true };
				ns.scp('protoweak.js', block.server);
				ns.exec('protoweak.js', block.server, threads, JSON.stringify(metrics));

				const assigned = threads * ns.getScriptRam('protoweak.js');
				block.ram -= assigned;
				block.used = true;
			}
		}
		await dataPort.nextWrite();
		await ns.sleep(100);
		buildramNetwork(ns, ramNetwork, values)
	}
	while (ns.getHackingLevel() < 100) {
		for (const block of ramNetwork) {
			const cost = ns.getScriptRam('protogrow.js');
			if (block.ram / cost >= 1 && !block.used) {
				const threads = Math.floor(block.ram / cost);
				const metrics = { target: values.optimalTarget, job: 'grow', delay: 0, port: ns.pid, portwrite: true };
				ns.scp('protogrow.js', block.server);
				ns.exec('protogrow.js', block.server, threads, JSON.stringify(metrics));

				const assigned = threads * ns.getScriptRam('protogrow.js');
				block.ram -= assigned;
				block.used = true;
			}
		}
		await dataPort.nextWrite();
		await ns.sleep(100);
		buildramNetwork(ns, ramNetwork, values)
	}
	ns.tprint('Hacking level sufficient. joesguns should be prepped, and you should be above level 100 hacking. go make money.');

}
