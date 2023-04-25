/**
 * @param {NS} ns
 * @returns {[]string}
 */

//function loop checks if each program that open ports exists.
function countPrograms(ns) {
	const fileArray = ["brutessh.exe", "ftpcrack.exe", "relaysmtp.exe", "httpworm.exe", "sqlinject.exe"];
	let fileCount = 0;
	for (let i = 0; i < fileArray.length;) {
		fileCount += ns.fileExists(fileArray[i], 'home');
		i++;
	}
	return fileCount;
}

//function called canHack that tests the ports required to hack and the hacking level required to access.
//returns false if either tests aren't passed, returns true otherwise.
function canHack(ns, server) {
	if (ns.getServerRequiredHackingLevel(server) > ns.getHackingLevel()) return false;
	if (ns.getServerNumPortsRequired(server) > countPrograms(ns)) return false;
	return true;
}

//function to open all the ports on the parameter server.
function breakingAndEntering(ns, server, portScript) {
	ns.print('breakingAndEntering called');
	ns.print('ns.getServerNumPortsRequired thinks the server is: ' + server);
	ns.exec(portScript, 'home', 1, server);
	ns.print('breakingAndEntering applied to ' + server);
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
function employ(ns, server, paramTarget, virus, virusRam) {
	ns.print("employ called");
	if (ns.fileExists(virus, server) == false) { ns.scp(virus, server); }
	if (ns.scriptRunning(virus, server)) { ns.scriptKill(virus, server); }
	let maxThreads = Math.floor(ns.getServerMaxRam(server) / virusRam);
	ns.exec(virus, server, maxThreads, paramTarget);
	ns.print(virus + ' ran on ' + server + ' with ' + maxThreads + ' threads, with a target of ' + paramTarget);
}


function getServerList(ns) {
	let found = [];
	let unscanned = ['home'];

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
function attack(ns, server, virus, virusRam, portScript) {
	let curTar = getServerList(ns);
	for (let i = 0; i < curTar.length; i++) {
		if (canHack(ns, curTar[i])) {
			breakingAndEntering(ns, curTar[i], portScript);
			if (ns.getServerMaxRam(curTar[i]) > virusRam) {
				employ(ns, curTar[i], server, virus, virusRam);
			}
		}
	}
	ns.print('NUKEd servers now directed to hack: ' + server + ' with ' + virus);
}

//function to direct the purchased servers as well. 
function commandPurchasedServers(ns, server, virus, virusRam) {

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
	ns.print('Pservs now directed to hack: ' + server + ' with ' + virus);
}

//function to initialize the home server to use half its ram to use the virus.
//this helps in the early part of a run especially
function homeAttack(ns, server, virus, virusRam, reserveRam) {
	let homeServer = 'home';
	if (ns.scriptRunning(virus, homeServer)) {
		ns.scriptKill(virus, homeServer)
	}
	let homeRam = (ns.getServerMaxRam(homeServer) - ns.getServerUsedRam(homeServer) - reserveRam);
	let homeThreads = Math.floor(homeRam / virusRam);
	ns.exec(virus, homeServer, homeThreads, server);
	ns.print('Home hacking: ' + server + ' with ' + virus + ', with ' + homeThreads + ' threads.');}


/** @param {NS} ns */
export async function main(ns) {

	ns.disableLog('ALL');
	ns.tail();
	//moneymaking script. default hack/grow/weaken loop or 'early-hack-template.js'
	const virus = 'early-hack-template.js';
	//script that contains logic to run all port opening programs and nuke.exe.
	const portScript = 'portopener.js'
	const virusRam = ns.getScriptRam(virus);
	//arbitrary amount of ram to keep open on home computer. required for calling other scripts
	const reserveRam = 4;
	let serverListWeights = updateTarget(ns);
	let target = getBestTarget(ns, serverListWeights).name;
	ns.print('Target is now: ' + target);
	breakingAndEntering(ns, target, portScript);
	attack(ns, target, virus, virusRam, portScript)
	commandPurchasedServers(ns, target, virus, virusRam)
	homeAttack(ns, target, virus, virusRam, reserveRam);


	let curTar = target;
	while (true) {
		await ns.sleep(10000);
		countPrograms(ns);
		serverListWeights = updateTarget(ns);
		let savedTar = getBestTarget(ns, serverListWeights).name;
		if (curTar == savedTar) continue;
		curTar = savedTar;
		ns.print('Target is now: ' + curTar);
		breakingAndEntering(ns, curTar, portScript);
		attack(ns, curTar, virus, virusRam);
		commandPurchasedServers(ns, curTar, virus, virusRam)
		homeAttack(ns, curTar, virus, virusRam, reserveRam);

	}

}
