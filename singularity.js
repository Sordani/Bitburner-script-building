import { getServerList, getAccess } from "slibs.js";

/** @param {NS} ns */
export function buyAugs(ns, ownedAugs) {
	const player = ns.getPlayer();
	const factions = player.factions;
	for (const faction of factions) {
		const money = player.money
		const factRep = ns.singularity.getFactionRep(faction)
		const augs = ns.singularity.getAugmentationsFromFaction(faction);
		for (const aug of augs) {
			if (ownedAugs.includes(aug)) continue;
			if (ns.singularity.getAugmentationPrice(aug) > money) continue;
			if (ns.singularity.getAugmentationRepReq(aug) > factRep) continue;
			const preReq = ns.singularity.getAugmentationPrereq(aug);
			if (!ownedAugs.includes(preReq)) continue;
			ns.singularity.purchaseAugmentation(faction, aug);
		}
	}
}

/** @param {NS} ns */
export function manAboutTown(ns) {
	const cities = ["Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven", "Sector-12"];
	for (const city of cities) {
		ns.singularity.travelToCity(city);
		ns.singularity.checkFactionInvitations();
	}
}

/** @param {NS} ns */
export function factionHandling(ns, ownedAugs) {
	manAboutTown(ns);
	let factInv = ns.singularity.checkFactionInvitations();
	for (const fact of factInv) {
		const augs = ns.singularity.getAugmentationsFromFaction(fact);
		for (const aug of augs) {
			if (!ownedAugs.includes(aug)) {
				ns.singularity.joinFaction(fact);
				break;
			}
		}
	}
}

/** @param {NS} ns */
export async function installBackdoors(ns) {
	const serverList = getServerList(ns);
	for (const server of serverList) {
		if (ns.getServer(server).backdoorInstalled || !ns.getServer(server).hasAdminRights || ns.getServer(server).requiredHackingSkill > ns.getHackingLevel()) continue;
		ns.singularity.connect("home");
		let route = [server];
		while (route[0] != "home") route.unshift(ns.scan(route[0])[0]);
		for (const server of route) ns.singularity.connect(server);
		await ns.singularity.installBackdoor();
		ns.singularity.connect("home");
	}
}

/** @param {NS} ns */
export function obtainPrograms(ns) {
	ns.singularity.purchaseTor();
	const programs = ns.singularity.getDarkwebPrograms();
	if (programs === null) return;
	for (const program of programs) {
		if (ns.getPlayer().money < ns.singularity.getDarkwebProgramCost(program) || ns.fileExists(program)) continue;
		ns.singularity.purchaseProgram(program);
	}
}

/** @param {NS} ns */
export async function upgradeHome(ns) {
	let homeServer = ns.getServer('home');
	while (homeServer.moneyAvailable > ns.singularity.getUpgradeHomeRamCost() || homeServer.moneyAvailable > ns.singularity.getUpgradeHomeCoresCost()) {
		if (homeServer.moneyAvailable > ns.singularity.getUpgradeHomeRamCost()) {
			ns.singularity.upgradeHomeRam();
			homeServer = ns.getServer('home');
		}
		if (homeServer.moneyAvailable > ns.singularity.getUpgradeHomeCoresCost()) {
			ns.singularity.upgradeHomeCores();
			homeServer = ns.getServer('home');
		}
		await ns.sleep(0);
	}
}

/** @param {NS} ns */
export function installAug(ns) {
	const purAugs = getPurchasedAugs(ns);
	if (purAugs.length < 5 && !purAugs.includes("red pill")) { return; }
	ns.singularity.installAugmentations("brain.js");
}

/** @param {NS} ns */
export function getPurchasedAugs(ns) {
	const ownedAugs = ns.singularity.getOwnedAugmentations(false);
	const purchasedAugs = ns.singularity.getOwnedAugmentations(true);
	for (let aug of purchasedAugs) {
		if (!ownedAugs.includes(aug)) continue;
		const index = purchasedAugs.indexOf(aug);
		purchasedAugs.splice(index, 1);
	}
	return purchasedAugs;
}

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	ns.disableLog("scan");
	ns.disableLog("getHackingLevel");
	const ownedAugs = ns.singularity.getOwnedAugmentations(true);
	obtainPrograms(ns);
	await getAccess(ns, getServerList(ns));
	await installBackdoors(ns);
	factionHandling(ns, ownedAugs);
	buyAugs(ns, ownedAugs);
	await upgradeHome(ns);
}
