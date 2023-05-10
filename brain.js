//importing functions from slibs.js function library for cleanliness.
import { expMode, countPrograms, canHack, getServerList, Weight, updateTarget, getBestTarget, getAccess } from "slibs.js";

//kills the running script and runs new script on parameter server at parameter target.
/** @param {NS} ns */
function employ(ns, server, paramTarget, virus, virusRam) {
	if (ns.fileExists(virus, server) == false) { ns.scp(virus, server); }
	if (ns.scriptRunning(virus, server)) { ns.scriptKill(virus, server); }
	let maxThreads = Math.floor(ns.getServerMaxRam(server) / virusRam);
	ns.exec(virus, server, maxThreads, paramTarget);
}

//Function to call the results of getServerList() and go item by item through the array
//to gain root access and utilize the ram if any is available.
/** @param {NS} ns */
async function attack(ns, server, virus, virusRam) {
	let curTar = getServerList(ns);
	for (let i = 0; i < curTar.length; i++) {
		if (canHack(ns, curTar[i])) {
			if (ns.getServerMaxRam(curTar[i]) > virusRam) {
				employ(ns, curTar[i], server, virus, virusRam);
			}
		}
	}
	ns.print('NUKEd servers now directed to hack: ' + server + ' with ' + virus);
}

//function to direct the purchased servers as well.
/** @param {NS} ns */
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
//currently not in use as 'home' is being used for other needs.
/** @param {NS} ns */
function homeAttack(ns, server, virus, virusRam, reserveRam) {
	let homeServer = 'home';
	if (ns.scriptRunning(virus, homeServer)) {
		ns.scriptKill(virus, homeServer)
	}
	let homeRam = (ns.getServerMaxRam(homeServer) - ns.getServerUsedRam(homeServer) - reserveRam);
	let homeThreads = Math.floor(homeRam / virusRam);
	ns.exec(virus, homeServer, homeThreads, server);
	ns.print('Home hacking: ' + server + ' with ' + virus + ', with ' + homeThreads + ' threads.');
}


/** @param {NS} ns */
export async function main(ns) {

	ns.disableLog('ALL');
	ns.tail();
	if (ns.getHackingLevel() < 100) {
		ns.print('starting expmode. set to level 100');
		await getAccess(ns, getServerList(ns));
		await expMode(ns)
	}
	//moneymaking script. default hack/grow/weaken loop or 'early-hack-template.js'
	const virus = 'early-hack-template.js';
	const virusRam = ns.getScriptRam(virus);
	//arbitrary amount of ram to keep open on home computer. required for calling other scripts
	//const reserveRam = 4;


	let curTar = 'n00dles'; //this will almost certainly get changed.
	while (true) {
		await ns.sleep(1000);
		await getAccess(ns, getServerList(ns));
		let savedTar = getBestTarget(ns, updateTarget(ns));
		if (curTar == savedTar) continue;
		curTar = savedTar;
		ns.print('Target is now: ' + curTar);
		await attack(ns, curTar, virus, virusRam);
		commandPurchasedServers(ns, curTar, virus, virusRam)
		//homeAttack(ns, curTar, virus, virusRam, reserveRam);

	}

}
