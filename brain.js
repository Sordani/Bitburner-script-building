/** @param {NS} ns */
export async function main(ns) {

	const virus = 'early-hack-template.js';
	const virusRam = ns.getScriptRam(virus);

	//creates an array with the names of all of current programs that open ports.
	var fileArray = ["brutessh.exe", "ftpcrack.exe", "relaysmtp.exe", "httpworm.exe", "sqlinject.exe"];
	var fileCount = 0;
	//loop checks if each program that open ports exists.
	//javascript translates true to 1 and false to 0
	//add them all together and you get the number of programs that exist assigned to the fileCount variable.
	function countPrograms() {

		for (var i = 0; i < fileArray.length;) {
			fileCount += ns.fileExists(fileArray[i]);
			i++;
		}
	}
	//calls an initial count of programs.
	countPrograms();

	//function called canHack that tests the ports required to hack and the hacking level required to access.
	//returns false if either tests aren't passed, returns true otherwise.
	function canHack(server) {
		if (ns.getServerRequiredHackingLevel(server) > ns.getHackingLevel()) return false;
		if (ns.getServerNumPortsRequired(server) > fileCount) return false;
		return true;
	}

	//function called breaking with the parameter of the server to open all the ports on the server.
	function breaking(server) {
		let numPortsReq = ns.getServerNumPortsRequired(server);
		if (numPortsReq > 0) {
			ns.brutessh(server);
		}
		if (numPortsReq > 1) {
			ns.ftpcrack(server);
		}
		if (numPortsReq > 2) {
			ns.relaysmtp(server);
		}
		if (numPortsReq > 3) {
			ns.httpworm(server);
		}
		if (numPortsReq > 4) {
			ns.sqlinject(server);
		}
	}

	function entering(server) {
		ns.nuke(server);
	}

	function employ(server) {
		ns.scp(virus, server);
		if (ns.scriptRunning(virus, server)) {
			ns.killall(server);
		}
		let maxThreads = Math.floor(ns.getServerMaxRam(server) / virusRam);
		ns.exec(virus, server, maxThreads, target);
	}

	// copied this straight from #early-game pinned messages in the bitburner discord. posted by xsinx#1018
	// Returns a weight that can be used to sort servers by hack desirability
	function Weight(ns, server) {
		if (!server) return 0;

		// Don't ask, endgame stuff
		if (server.startsWith('hacknet-node')) return 0;

		// Get the player information
		let player = ns.getPlayer();

		// Get the server information
		let so = ns.getServer(server);

		// Set security to minimum on the server object (for Formula.exe functions)
		so.hackDifficulty = so.minDifficulty;

		// We cannot hack a server that has more than our hacking skill so these have no value
		if (so.requiredHackingSkill > ns.getHackingLevel()) {
			return 0;
		}

		//adding my own line of requiring enough programs to actually get into a server to give any weight to a target
		if (ns.getServerNumPortsRequired(server) > fileCount) {
			return 0;
		}

		// Default pre-Formulas.exe weight. minDifficulty directly affects times, so it substitutes for min security times
		let weight = so.moneyMax / so.minDifficulty;

		// If we have formulas, we can refine the weight calculation
		if (ns.fileExists('Formulas.exe')) {
			// We use weakenTime instead of minDifficulty since we got access to it, 
			// and we add hackChance to the mix (pre-formulas.exe hack chance formula is based on current security, which is useless)
			weight = so.moneyMax / ns.formulas.hacking.weakenTime(so, player) * ns.formulas.hacking.hackChance(so, player);
		}
		else
			// If we do not have formulas, we can't properly factor in hackchance, so we lower the hacking level tolerance by half
			if (so.requiredHackingSkill > player.skills.hacking / 2)
				return 0;

		return weight;
	}

	function getServerList() {
		let serverTargetList = [];
		let scanResults = [ns.getHostname()];

		//scanResults has a single servername inside it when this initializes, the current host.
		while (scanResults.length > 0) {
			//takes hostname OUT of the scanResults array and assigns it to potentialTargetServer
			var potentialTargetServer = scanResults.pop();
			//neighboringServers = the array of all nearby nodes of potentialTargetServer
			var neighboringServers = ns.scan(potentialTargetServer);

			for (var i = 0; i < neighboringServers.length; i++) {
				if (serverTargetList.includes(neighboringServers[i])) continue;
				serverTargetList.push(neighboringServers[i]);
				scanResults.push(neighboringServers[i]);
			}

		}
		return serverTargetList;
	}

	let serverList = getServerList();
	let targetNameAndWeight = new Array(serverList.length);

	function updateTarget(server) {
		for (let i = 0; i < serverList.length; i++) {
			targetNameAndWeight[i] = ["", 0];
			targetNameAndWeight[i][0] = serverList[i];
			targetNameAndWeight[i][1] = Weight(ns, serverList[i]);
		}
	}

	function getBestTarget(twodeeArray) {
		let bestTarget = "";
		let highestWeight = 0;

		for (let i = 0; i < twodeeArray.length; i++) {
			let weight = twodeeArray[i][1];
			if (weight > highestWeight) {
				highestWeight = weight;
				bestTarget = twodeeArray[i][0];
			}
		}

		return bestTarget;
	}

	updateTarget();
	
	//sets the target with the most desirability from all possible servers
	let target = getBestTarget(targetNameAndWeight);

	//accessing the target first so we can run our virus with impunity
	breaking(target);
	entering(target);

	function attack(server) {
		for (let i = 0; i < serverList.length; i++) {
			let curTar = serverList[i];
			if (canHack(curTar)) {
				breaking(curTar);
				entering(curTar);
				if (ns.getServerMaxRam(curTar) > virusRam) {
					employ(curTar);
				}
			}
		}
	}



	//function to direct the purchased servers as well. 
	function commandPurchasedServers(server) {
		if (ns.getPurchasedServers().length > 0) {

			//if true, this for loop will tell the purchased servers whom to target as well.
			for (let i = 0; i < ns.getPurchasedServers().length; i++) {
				//acquires server ram size
				let serverName = "pserv-" + i;
				let serverRam = ns.getServerMaxRam(serverName);
				//calculates how many threads we can run our script on a single server at the same time
				//the math.floor() calculation rounds down so even if it's 2.999999999999999... it will 
				//still round down to 2.
				let maxThreads = Math.floor(serverRam / virusRam);
				//copy the virus to the server
				ns.scp(virus, serverName);
				//if there are any scripts currently running on the server		
				if (ns.scriptRunning(virus, serverName)) {
					//end the scripts first (if any are running and you try to run more it errors out)
					ns.scriptKill(virus, serverName);
				}
				//execute script on server with maximum number of threads possible.
				ns.exec(virus, serverName, maxThreads, target);
			}
		}
	}

	//function to initialize the home server to use half its ram to use the virus.
	//this helps in the early part of a run especially
	function homeAttack(server) {
		let homeServer = ns.getHostname();
		let homeRam = (ns.getServerMaxRam(homeServer) / 2);
		let homeThreads = Math.floor(homeRam / virusRam);
		if (ns.scriptRunning(virus, homeServer)) {
			ns.scriptKill(virus, homeServer)
		}
		ns.exec(virus, homeServer, homeThreads, target);
	}

	//finally, we want to run all of what we've established on a loop, 
	//and refire scripts when a new target weight is established
	while (true) {
		let currentTarget = target;
		countPrograms();
		updateTarget(targetNameAndWeight);
		if (!currentTarget == getBestTarget(targetNameAndWeight)) {
			target = getBestTarget(targetNameAndWeight);
			breaking(target);
			entering(target);
			attack(target);
			commandPurchasedServers(target);
			homeAttack(target);

		}
		await ns.sleep(10000);
	}

}