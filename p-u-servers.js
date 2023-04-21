/** @param {NS} ns **/
export async function main(ns) {

	// This script is designed to purchase 24 servers at 4Gigs of ram, then constantly check for
	// sufficient money to upgrade the servers incrementally, on a loop, until they are max size. 
	// this script is intended to be used when you have zero servers or when you have purchased 
	// 25 servers and they are all the same size.

	let maxServers = ns.getPurchasedServerLimit();
	let maxRam = ns.getPurchasedServerMaxRam();
	let money = ns.getPlayer().money;
	//rename this to whatever your hack grow weaken loop script is
	let virus = "early-hack-template.js";
	let virusRam = ns.getScriptRam(virus);
	//set this to the size you want your first servers to be when you purchase them.
	let starterRam = 4;
	let serverSize = 0;
	let maxThreads = 0;
	//we're using servers as an array of strings containing all the names of all the servers we currently have.
	let servers = ns.getPurchasedServers();
	//iterator
	let i = 0;

	//checks if we have no servers
	if (servers.length < maxServers) {
		// Continuously try to purchase servers until we've reached the maximum
		// amount of servers
		while (i < maxServers) {
			// Check if we have enough money to purchase a server
			if (money > ns.getPurchasedServerCost(starterRam)) {
				// If we have enough money, then:
				//  1. Purchase the server
				//  2. Copy our hacking script onto the newly-purchased server
				//  3. Run our hacking script on the newly-purchased server with 3 threads
				//  4. Increment our iterator to indicate that we've bought a new server
				let serverName = "pserv-" + i;

				let serverIndex = servers.findIndex(server => server.startsWith(serverName));
				if (serverIndex !== -1) {
					serverName = servers[serverIndex];
					servers.splice(serverIndex, 1);
				}
				else {
					serverName = ns.purchaseServer(serverName, starterRam);
				}
				ns.scp(virus, serverName);
				serverSize = ns.getServerMaxRam(serverName);
				maxThreads = Math.floor(serverSize / virusRam)
				ns.exec(virus, serverName, maxThreads);
				++i;
			}
			//Make the script wait for a second before looping again.
			//Removing this line will cause an infinite loop and crash the game.
			await ns.sleep(1000);
			servers = ns.getPurchasedServers();
		}
	}

	//Check if all servers have already been upgraded to the maximum size.

	const allServersUpgraded = servers && servers.every(server => ns.getServerMaxRam(server) === maxRam);

	// if not all servers have been upgraded, upgrade them.

	if (allServersUpgraded) {

		//gracefully ends the script with a message that all servers upgraded

		ns.tprint("All servers are already at max ram size possible.");

		//kills current script

		ns.exit();
	}

	//

	while (true) {
		const availableMoney = ns.getServerMoneyAvailable('home');
		const upgradeCost = maxRam * 2 * servers.length;
		if (upgradeCost <= availableMoney) {
			for (let i = 0; i < servers.length; i++) {
				const server = servers[i];
				const currentRam = ns.getServerMaxRam(server);
				if (currentRam < maxRam) {
					const upgradeCost = ns.getPurchasedServerUpgradeCost(server, currentRam * 2);
					if (upgradeCost < availableMoney / maxServers) {
						ns.tprint('Upgrading server ' + server + ' from ' + currentRam + ' GB to ' + currentRam * 2 + 'GB...');
						ns.upgradePurchasedServer(server, currentRam * 2);

						let serverRam = ns.getServerMaxRam("pserv-" + i)
						let maxThreads = Math.floor(serverRam / virusRam);
						ns.scp(virus, "pserv-" + i);
						ns.tprint("telling pserv-" + i + " to run the virus " + maxThreads + " times.");
						if (ns.scriptRunning(virus, "pserv-" + i)) {
							ns.scriptKill(virus, "pserv-" + i);
						}
						ns.exec(virus, "pserv-" + i, maxThreads);



						await ns.sleep(1000);
					}
				}
			}
		} else {

			await ns.sleep(10000); // wait for 10 seconds
		}

		if (ns.getServerMaxRam(servers[0]) == maxRam) {
			ns.tprint("All Servers ugpraded to " + maxRam + "GB, shutting down p-u-servers.js");
			ns.exit();
		}


		await ns.sleep(10000); // wait for 5 minutes before checking for upgrades again
	}
}