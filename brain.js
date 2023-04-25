/**
 * @param {NS} ns
 * @returns {[]string}
 */

//function loop checks if each program that open ports exists.
function countPrograms(ns) {
	const fileArray = ["brutessh.exe", "ftpcrack.exe", "relaysmtp.exe", "httpworm.exe", "sqlinject.exe"];
	let fileCount = 0;
	for (let i = 0; i < fileArray.length;) {
		fileCount += ns.fileExists(fileArray[i], ns.getHostname());
		i++;
	}
	return fileCount;
}

//function called canHack that tests the ports required to hack and the hacking level required to access.
//returns false if either tests aren't passed, returns true otherwise.
function canHack(ns, server) {
	ns.print('canHack called');
	if (ns.getServerRequiredHackingLevel(server) > ns.getHackingLevel()) return false;
	if (ns.getServerNumPortsRequired(server) > countPrograms(ns)) return false;
	return true;
}

//function to open all the ports on the parameter server.
function breaking(ns, server) {
	ns.print('breaking called');
	ns.print('ns.getServerNumPortsRequired thinks the server is: ' + server);
	let numPortsReq = ns.getServerNumPortsRequired(server);
	if (numPortsReq > 0) { ns.brutessh(server); }
	if (numPortsReq > 1) { ns.ftpcrack(server); }
	if (numPortsReq > 2) { ns.relaysmtp(server); }
	if (numPortsReq > 3) { ns.httpworm(server); }
	if (numPortsReq > 4) { ns.sqlinject(server); }
	ns.print('breaking applied to ' + server);
}

//function to gain root access to the parameter server
function entering(ns, server) {
	ns.print('entering called');
	if (ns.hasRootAccess(server) == false) {
		ns.nuke(server);
		ns.print("nuked " + server);
	}
}

// copied this straight from #early-game pinned messages in the bitburner discord. posted by xsinx#1018
// Returns a weight that can be used to sort servers by hack desirability
function Weight(ns, server) {
	if (!server) return 0;
	if (server.startsWith('hacknet-node')) return 0;
	let player = ns.getPlayer();
	let so = ns.getServer(server);
	so.hackDifficulty = so.minDifficulty;
	if (so.requiredHackingSkill > ns.getHackingLevel()) { return 0; }
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

//kills the running script and runs new script on parameter server at parameter target.
function employ(ns, server, paramTarget) {
	ns.print("employ called");

	const virus = 'early-hack-template.js';
	const virusRam = ns.getScriptRam(virus);
	if (ns.fileExists(virus, server) == false) { ns.scp(virus, server); }
	if (ns.scriptRunning(virus, server)) { ns.scriptKill(virus, server); }
	let maxThreads = Math.floor(ns.getServerMaxRam(server) / virusRam);
	ns.exec(virus, server, maxThreads, paramTarget);
	ns.print(virus + ' ran on ' + server + ' with ' + maxThreads + ' threads, with a target of ' + paramTarget);
}


function getServerList(ns) {
	let found = [];
	let unscanned = [ns.getHostname()];

	while (unscanned.length > 0) {
		let server = unscanned.pop();
		let neighboors = ns.scan(server);
		for (let i = 0; i < neighboors.length; i++) {
			if (found.includes(neighboors[i])) continue;
			found.push(neighboors[i]);
			unscanned.push(neighboors[i]);
		}

	}
	return found;
}

//function to return a 2d array containing the results of getServerList(); in one column and Weight(); in another
function updateTarget(ns) {
	return getServerList(ns).map((server) => ({ name: server, score: Weight(ns, server) }))
}

//function that requires the results of updateTarget() and parses the information to find the highest weighted server name.
function getBestTarget(ns, serverList) {
	return serverList.sort((a, b) => b.score - a.score)[0]
}

//Function to call the results of getServerList() and go item by item through the array
//to gain root access and utilize the ram if any is available.
function attack(ns, server) {
	const virus = 'early-hack-template.js';
	const virusRam = ns.getScriptRam(virus);
	let curTar = getServerList(ns);
	for (let i = 0; i < curTar.length; i++) {
		if (canHack(ns, curTar[i])) {
			breaking(ns, curTar[i]);
			entering(ns, curTar[i]);
			if (ns.getServerMaxRam(curTar[i]) > virusRam) {
				employ(ns, curTar[i], server);
			}
		}
	}
	ns.print('All non-friendly servers now directed to hack: ' + server + ' with ' + virus);
}

//function to direct the purchased servers as well. 
function commandPurchasedServers(ns, server) {

	let virus = 'early-hack-template.js';
	let virusRam = ns.getScriptRam(virus);
	let pServerList = ns.getPurchasedServers();
	if (pServerList.length > 0) {
		for (let i = 0; i < pServerList.length; i++) {
			let serverName = pServerList[i];
			let serverRam = ns.getServerMaxRam(serverName);
			let maxThreads = Math.floor(serverRam / virusRam);
			ns.scp(virus, serverName);
			if (ns.scriptRunning(virus, serverName)) {
				ns.scriptKill(virus, serverName);
			}
			ns.exec(virus, serverName, maxThreads, server);
		}
	}
	ns.print('All purchased friendly servers now directed to hack: ' + server + ' with ' + virus);
}

//function to initialize the home server to use half its ram to use the virus.
//this helps in the early part of a run especially
function homeAttack(ns, server) {
	const virus = 'early-hack-template.js';
	const virusRam = ns.getScriptRam(virus);
	let homeServer = ns.getHostname();
	if (ns.scriptRunning(virus, homeServer)) {
		ns.scriptKill(virus, homeServer)
	}
	let homeRam = (ns.getServerMaxRam(homeServer) - ns.getServerUsedRam(homeServer));
	let homeThreads = Math.floor(homeRam / virusRam);
	ns.exec(virus, homeServer, homeThreads, server);
	ns.print('Home computer now directed to hack: ' + server + ' with ' + virus + ' ' + homeThreads + ' times.');
}


/** @param {NS} ns */
export async function main(ns) {

	ns.disableLog('ALL'); 
	ns.tail();
	const virus = 'early-hack-template.js';
	const virusRam = ns.getScriptRam(virus);
	let fileCount = countPrograms(ns);
	let serverList = getServerList(ns);
	let serverListWeights = updateTarget(ns);
	let target = getBestTarget(ns, serverListWeights).name;
	ns.print('Target is now: ' + target);
	breaking(ns, target);
	entering(ns, target);
	attack(ns, target);
	commandPurchasedServers(ns, target);
	homeAttack(ns, target);


	let curTar = target;
	while (true) {
		await ns.sleep(10000);
		countPrograms(ns);
		serverListWeights = updateTarget(ns);
		let savedTar = getBestTarget(ns, serverListWeights).name;
		if (curTar == savedTar) continue;
		curTar = savedTar;
		ns.print('Target is now: ' + curTar);
		breaking(ns, curTar);
		entering(ns, curTar);
		attack(ns, curTar);
		commandPurchasedServers(ns, curTar);
		homeAttack(ns, curTar);

	}

}
