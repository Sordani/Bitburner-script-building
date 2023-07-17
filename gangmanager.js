/** @param {NS} ns */
export function taskManager(ns) {
	const targetValue = 200; //combat stats to train to before working.
	for (const member of ns.gang.getMemberNames()) {
		const memberData = ns.gang.getMemberInformation(member);
		const gangData = ns.gang.getGangInformation();
		const jobObj = [];
		if (memberData.str < targetValue * memberData.str_asc_mult
			|| memberData.agi < targetValue * memberData.agi_asc_mult
			|| memberData.def < targetValue * memberData.def_asc_mult
			|| memberData.dex < targetValue * memberData.dex_asc_mult) {
			ns.gang.setMemberTask(member, "Train Combat");
			continue;
		}
		for (const job of ns.gang.getTaskNames()) {
			const jobStats = ns.gang.getTaskStats(job),
				wantedGain = ns.formulas.gang.wantedLevelGain(gangData, memberData, jobStats),
				respectGain = ns.formulas.gang.respectGain(gangData, memberData, jobStats),
				moneyGain = ns.formulas.gang.moneyGain(gangData, memberData, jobStats);
			jobObj.push({ name: job, wantedGain, respectGain, moneyGain });
		}
		jobObj.sort((a, b) => a.respectGain < b.respectGain ? 1 : -1);
		if (gangData.respect >= 2e6 && 1 - ns.gang.getGangInformation().wantedPenalty < 0.05) {
			jobObj.sort((a, b) => a.moneyGain < b.moneyGain ? 1 : -1);
		}
		if (gangData.territoryClashChance === 0 || memberData.def > 600) {
			ns.gang.setMemberTask(member, "Territory Warfare");
		} else {
			for (const job of jobObj) {
				if (job.respectGain < job.wantedGain * 99) continue;
				ns.gang.setMemberTask(member, job.name);
				break;
			}
		}
	}
}

/** @param {NS} ns */
export function warHandler(ns) {
	const gangData = ns.gang.getGangInformation(), otherGangsData = ns.gang.getOtherGangInformation(), members = ns.gang.getMemberNames();
	let warBool = true;
	if (members.length < 12) { warBool = false; }
	for(const [name,gang] of Object.entries(ns.gang.getOtherGangInformation())) { //thank jakob for this
		if (name == gangData.faction) { continue; }
		if (ns.gang.getChanceToWinClash(name) < 0.55) { warBool = false; }
	}
	ns.gang.setTerritoryWarfare(warBool && gangData.territory < 1);
}

/** @param {NS} ns */
export async function warZone(ns) {
	let gangData = ns.gang.getGangInformation();
	while (gangData.territoryWarfareEngaged && gangData.territory < 1) {
		gangData = ns.gang.getGangInformation();
		for (const member of ns.gang.getMemberNames()) {
			ns.gang.setMemberTask(member, "Territory Warfare")
		}
		await ns.sleep(500);
	}
}


/** @param {NS} ns */
export async function main(ns) {
	const player = ns.getPlayer();
	const gangBool = player.factions.includes("Slum Snakes");
	if (gangBool && !ns.gang.inGang()) { ns.gang.createGang("Slum Snakes"); }
	const names = [
		"Kip Guile",
		"Cruxor",
		"Ben-Hadad",
		"Big Leo",
		"Ferkudi",
		"Winsen",
		"Teia",
		"Trainer Fisk",
		"Ironfist",
		"Liv Danavis",
		"Karris Whiteoak",
		"Sevastian"
	];
	for (const name of ns.gang.getMemberNames()) {
		if (names.includes(name)) { names.splice(names.indexOf(name), 1); }
	}
	const augNames = [];
	while (true) {
		if (ns.gang.canRecruitMember()) {
			const gangName = names[Math.floor(Math.random() * names.length)];
			ns.gang.recruitMember(gangName);
			names.splice(names.indexOf(gangName), 1);
		}
		for (const equip of ns.gang.getEquipmentNames()) {
			if (ns.gang.getEquipmentType(equip) == "Augment") { augNames.push(equip); }
		}
		for (const member of ns.gang.getMemberNames()) {
			for (const aug of augNames) {
				if (ns.gang.getEquipmentCost(aug) < ns.getServerMoneyAvailable("home")) {
					ns.gang.purchaseEquipment(member, aug);
				}
			}
			for (const equip of ns.gang.getEquipmentNames()) {
				if (ns.gang.getEquipmentCost(equip) < ns.getServerMoneyAvailable("home")) {
					ns.gang.purchaseEquipment(member, equip);
				}
			}
		}
		for (const member of ns.gang.getMemberNames()) {
			const memberData = ns.gang.getMemberInformation(member);
			if (ns.gang.getAscensionResult(member) === undefined) { continue; }
			if (memberData.str_exp < 1000) { continue; }
			if (ns.gang.getAscensionResult(member).str >= 1.5) {
				ns.gang.ascendMember(member);
			}
		}
		taskManager(ns);
		warHandler(ns);
		await warZone(ns);
		await ns.sleep(0);
	}

}
