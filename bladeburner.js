/** @param {NS} ns */
export function skillGet(ns) {
	const bbSkills = [];
	if (ns.bladeburner.getSkillLevel('Overclock') < 20) {
		const x = {
			name: 'Overclock',
			upgradeCost: ns.bladeburner.getSkillUpgradeCost('Overclock')
		}
		bbSkills.push(x);
		return bbSkills;
	}
	for (const skill of ns.bladeburner.getSkillNames()) {
		//if (skillLimit(ns, skill)) continue;
		const v = {
			name: skill,
			upCost: ns.bladeburner.getSkillUpgradeCost(skill)
		}
		bbSkills.push(v);
	}
	if (bbSkills.length == 0) return false;
	bbSkills.sort((a, b) => (a.upCost - b.upCost));
	return bbSkills;
}

/** @param {NS} ns */
export async function skillBuy(ns) {
	while (skillGet(ns) !== false && skillGet(ns)[0].upCost < ns.bladeburner.getSkillPoints()) {
		const cheapSkill = skillGet(ns)[0];
		const hyperCount = 9 + 10 * ns.bladeburner.getSkillLevel(cheapSkill.name); 
		const levelUp = Math.floor((-hyperCount + Math.pow(hyperCount * hyperCount + 80 * ns.bladeburner.getSkillPoints(), 0.5)) / 10);
		ns.bladeburner.upgradeSkill(cheapSkill.name, levelUp);
		ns.print("Upgraded " + cheapSkill.name + " to " + (cheapSkill.level + 1) + " for " + cheapSkill.upCost);
		await ns.sleep(0);
	}
}

/** @param {NS} ns */
export function skillLimit(ns, skill) {
	const skillLimits = [
		{ name: "Blade's Intuition", limit: 150 }, //success contracts, ops, and blops by 3%
		{ name: "Cloak", limit: 100 }, 						 //success in stealth contracts, ops, and blops by 5.5%
		{ name: "Short-Circuit", limit: 50 }, 		 //success in retirement Contracts, ops, and blobs by 5.5%
		{ name: "Digital Observer", limit: 100 },	 //success in all ops and blops by 4%
		{ name: "Tracer", limit: 20 },						 //success in all contracts by 4%
		{ name: "Overclock", limit: 90 },					 //decreases time it takes to attempt a contract, op or blop by 1%
		{ name: "Reaper", limit: 50 },						 //increases effective combat stats for BB by 2%
		{ name: "Evasive System", limit: 50 },		 //increases effective dexterity and agility for BB by 4%
		{ name: "Datamancer", limit: 40 },					 //increases effectiveness in analysis and investigation by 5% (+ synthoid pop/com estimate accuracy)
		{ name: "Cyber's Edge", limit: 25 }, 			 //increases max stamina by 2%
		{ name: "Hands of Midas", limit: 50 }, 		 //increases money received from contracts by 10%
		{ name: "Hyperdrive", limit: 50 }			 		 //increases exp earned from contracts, ops and blops by 10%
	];
	if (skillLimits.find(({ name }) => name === skill) != undefined) return skillLimits.find(({ name }) => name === skill).limit <= ns.bladeburner.getSkillLevel(skill);
	else return false;

}


// /** @param {NS} ns */
// export async function fieldAnal(ns) {
// 	let cityNames = ["Sector-12", "Aevum", "Volhaven", "Chongqing", "New Tokyo", "Ishima"];
// 	for (let c of cityNames) {
// 		{
// 			ns.bladeburner.stopBladeburnerAction();
// 			ns.print(`At ${Date().toString().padStart(2, 0)} Field Analysis Began in: ${c}`); ns.bladeburner.switchCity(c); ns.bladeburner.startAction("General", "Field Analysis");
// 			if (ns.bladeburner.getBonusTime() > 1000) {
// 				await ns.sleep((ns.bladeburner.getActionTime("General", "Field Analysis") - ns.bladeburner.getActionCurrentTime()) / 5);
// 			}
// 			else await ns.sleep(ns.bladeburner.getActionTime("General", "Field Analysis") - ns.bladeburner.getActionCurrentTime())
// 		}

// 	}
// 	ns.bladeburner.switchCity("Sector-12");
// 	ns.print(`At ${Date().toString()} Field Analysis Concluded. ${ns.bladeburner.getCurrentAction().name} Commenced with. `);
// }

/** @param {NS} ns */
export async function performThing(ns) {
	for (const act of ns.bladeburner.getBlackOpNames()) {
		if (ns.bladeburner.getActionCountRemaining("BlackOps", act) < 1) continue;
		if (ns.bladeburner.getActionEstimatedSuccessChance("BlackOps", act)[0] < 1 || ns.bladeburner.getBlackOpRank(act) > ns.bladeburner.getRank()) break;
		if (ns.bladeburner.getCurrentAction().name == act) return;
		if (!ns.singularity.getOwnedAugmentations().includes("The Blade's Simulacrum")) ns.singularity.stopAction();
		if (ns.bladeburner.startAction("BlackOps", act)) {
			await ns.sleep(ns.bladeburner.getActionTime("BlackOps", act));
			return;
		}
	}

	for (const act of [{ name: "Assassination", type: "Operations" }, { name: "Undercover Operation", type: "Operations" }, { name: "Investigation", type: "Operations" }, { name: "Tracking", type: "Contracts" }, { name: "Bounty Hunter", type: "Contracts" }, { name: "Retirement", type: "Contracts" }]) {
		if (ns.bladeburner.getActionEstimatedSuccessChance(act.type, act.name)[0] < 1 || ns.bladeburner.getActionCountRemaining(act.type, act.name) < 1) continue;
		if (ns.bladeburner.getCurrentAction().name == act.name) return;
		if (!ns.singularity.getOwnedAugmentations().includes("The Blade's Simulacrum")) ns.singularity.stopAction();
		if (ns.bladeburner.startAction(act.type, act.name)) {
			await ns.sleep(ns.bladeburner.getActionTime(act.type, act.name));
			return;
		}
	}

	for (const act of [{ name: "Investigation", type: "Operations" }, { name: "Field Analysis", type: "General" }]) {
		if (act.name == "Investigation" && ns.bladeburner.getActionCountRemaining(act.type, act.name) < 1) continue;
		if (ns.bladeburner.getCurrentAction().name == act.name) return;
		if (!ns.singularity.getOwnedAugmentations().includes("The Blade's Simulacrum")) ns.singularity.stopAction();
		if (ns.bladeburner.startAction(act.type, act.name)) {
			await ns.sleep(ns.bladeburner.getActionTime(act.type, act.name));
			return;
		}
	}
}

/** @param {NS} ns */
export async function doRiot(ns) {
	const riot = "Incite Violence";
	const buttPower = () => ns.bladeburner.getActionCountRemaining("Operations", "Assassination");
	if (ns.getPlayer().skills.charisma < 1e6) return;
	if (buttPower() == 0) {
		while (buttPower() < 1e4) {
			await ns.sleep(500);
			if (ns.bladeburner.getCurrentAction().name == riot) continue;
			if (!ns.singularity.getOwnedAugmentations().includes("The Blade's Simulacrum")) ns.singularity.stopAction();
			ns.bladeburner.startAction("General", riot);
		}
	}
}

/** @param {NS} ns */
export async function bactaTank(ns) {
	if (ns.getPlayer().hp.current / ns.getPlayer().hp.max < 0.5) {
		while (ns.getPlayer().hp.current / ns.getPlayer().hp < 1) {
			await ns.sleep(50);
			if (ns.getPlayer().hp.current / ns.getPlayer.hp.max === 1) continue;
			if (ns.bladeburner.getCurrentAction().name === "Hyperbolic Regeneration Chamber") continue;
			if (!ns.singularity.getOwnedAugmentations().includes("The Blade's Simulacrum")) ns.singularity.stopAction();
			ns.bladeburner.startAction("General", "HypberBolic Regeneration Chamber");
		}
	}
	if (ns.bladeburner.getStamina()[0] / ns.bladeburner.getStamina()[1] < 0.7) {
		const stamSnap = ns.bladeburner.getStamina()[0];
		const startTime = new Date();
		const acts = ["Training", "Hypberbolic Regeneration Chamber"];
		let action = acts[0];
		while (ns.bladeburner.getStamina()[0] / ns.bladeburner.getStamina()[1] < 1) {
			if (startTime + 60000 * 2 <= Date.now() && stamSnap >= ns.bladeburner.getStamina()[0]) action = acts[1];
			await ns.sleep(50);
			if (ns.bladeburner.getCurrentAction().name === action) continue;
			if (!ns.singularity.getOwnedAugmentations().includes("The Blade's Simulacrum")) ns.singularity.stopAction();
			ns.bladeburner.startAction("General", action);
		}
	}
}

/** @param {NS} ns */
export function joinB(ns) {
	ns.bladeburner.joinBladeburnerDivision();
	ns.bladeburner.joinBladeburnerFaction();
}

/** @param {NS} ns */
export async function chaosControl(ns) {
	const cities = ["Sector-12", "Aevum", "Volhaven", "Chongqing", "New Tokyo", "Ishima"];
	const c = ns.bladeburner.getCity();
	const action = "Diplomacy";
	if (ns.bladeburner.getCityChaos(c) > 50) {
		while (ns.bladeburner.getCityChaos(c) > 10) {
			await ns.sleep(500);
			if (ns.bladeburner.getCityChaos(c) > 10) return;
			if (ns.bladeburner.getCurrentAction().name == action) continue;
			if (!ns.singularity.getOwnedAugmentations().includes("The Blade's Simulacrum")) ns.singularity.stopAction();
			ns.bladeburner.startAction("General", action);
		}
	}
}

/** @param {NS} ns */
export async function chaosManagement(ns) {
	const cities = ["Sector-12", "Aevum", "Volhaven", "Chongqing", "New Tokyo", "Ishima"];
	if (!cities.some(e => ns.bladeburner.getCityChaos(e) > 1e50) || ns.getPlayer().skills.charisma < 1e6) return;
	ns.bladeburner.stopBladeburnerAction();
	let bigPop = {
		name: "Sector-12",
		pop: 0
	};
	for (const c of cities) {
		ns.bladeburner.switchCity(c);
		if (ns.bladeburner.getCityChaos(c) > 50) {
			ns.bladeburner.startAction("General", "Diplomacy");
			while (ns.bladeburner.getCityChaos(c) > 10) await ns.sleep(0);
		}
		const bool1 = ns.bladeburner.getCityChaos(c) === 0,
			bool2 = ns.bladeburner.getActionTime("Operations", "Investigation") === 1000,
			bool3 = ns.bladeburner.getActionEstimatedSuccessChance("Operations", "Investigation")[1] > 0.99;
		if (bool1 && bool2 && bool3) {
			ns.bladeburner.startAction("Operations", "Investigation");
			await ns.sleep(2000);
			ns.bladeburner.stopBladeburnerAction();
		}
		if (ns.bladeburner.getCityEstimatedPopulation(c) > bigPop.pop) {
			bigPop.name = c;
			bigPop.pop = ns.bladeburner.getCityEstimatedPopulation(c);
		}
	}
	ns.bladeburner.switchCity(bigPop.name);
}

/** @param {NS} ns */
export function printstuff(ns) {
	ns.clearLog();
	ns.print("Rank: " + ns.formatNumber(ns.bladeburner.getRank()) + " / HSkill: " + ns.hacknet.getHashUpgradeLevel("Exchange for Bladeburner SP") + " / HRank: " + ns.hacknet.getHashUpgradeLevel("Exchange for Bladeburner Rank"));
	ns.print("Stamina: " + ns.formatNumber(ns.bladeburner.getStamina()[0]) + " / Max: " + ns.formatNumber(ns.bladeburner.getStamina()[1]));
	const success = ns.bladeburner.getActionEstimatedSuccessChance(ns.bladeburner.getCurrentAction().type, ns.bladeburner.getCurrentAction().name)
	ns.print("Action: " + ns.bladeburner.getCurrentAction().name + " / ButtPower: " + ns.bladeburner.getActionCountRemaining("Operations", "Assassination"));
	ns.print("Success Chance: " + ns.formatPercent(success[0]) + " - " + ns.formatPercent(success[1]));
	ns.print("Chaos: " + ns.formatNumber(ns.bladeburner.getCityChaos(ns.bladeburner.getCity())) + " / Threshold: 50");
}

/** @param {NS} ns */
export async function hashSpend(ns) {
	if (ns.hacknet.hashCost("Exchange for Bladeburner SP") <= ns.hacknet.numHashes()) {
		while (ns.hacknet.hashCost("Exchange for Bladeburner SP") <= ns.hacknet.numHashes()) {
			ns.hacknet.spendHashes("Exchange for Bladeburner SP");
			await ns.sleep(0);
		}
	}
	if (ns.hacknet.hashCost("Exchange for Bladeburner Rank") <= ns.hacknet.numHashes()) {
		while (ns.hacknet.hashCost("Exchange for Bladeburner Rank") <= ns.hacknet.numHashes()) {
			ns.hacknet.spendHashes("Exchange for Bladeburner Rank");
			await ns.sleep(0);
		}
	}
}

/** @param {NS} ns */
export async function bladeSteves(ns) {
	const hacknets = ["hacknet-server-0", "hacknet-server-1", "hacknet-server-2", "hacknet-server-3", "hacknet-server-4", "hacknet-server-5", "hacknet-server-6", "hacknet-server-7", "hacknet-server-8", "hacknet-server-9", "hacknet-server-10"];
	const script = "bladesteves.js";
	const gangscript = "gangmanager.js";
	const availServs = ["home"];
	let runBool = false;
	for (const server of hacknets) {
		if (ns.scan("home").includes(server)) availServs.push(server);
	}
	for (const server of availServs) {
		if (ns.isRunning(gangscript, server)) runBool = true;
		if (ns.isRunning(script, server)) runBool = false;
		if (ns.getPlayer().skills.strength < 150) runBool = false;
	}
	if (!runBool) { return; }
	for (const server of availServs) {
		if (ns.getServerMaxRam(server) - ns.getServerUsedRam(server) < ns.getScriptRam(script)) continue;
		if (server != "home") { ns.scp(script, server, "home"); }
		ns.exec(script, server);
		break;
	}
}

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();
	ns.resizeTail(400, 150);
	ns.moveTail(530, 680);
	while (true) {
		joinB(ns);
		await bladeSteves(ns);
		if (ns.bladeburner.inBladeburner()) {
			await doRiot(ns);
			await bactaTank(ns);
			await hashSpend(ns);
			await skillBuy(ns);
			await chaosManagement(ns);
			await chaosControl(ns);
			await performThing(ns);
			//await fieldAnal(ns);
			printstuff(ns);
		}
		await ns.sleep(500);
	}

}
