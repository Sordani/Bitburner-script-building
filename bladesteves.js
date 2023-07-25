/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();
	ns.resizeTail(570, 275);
	ns.moveTail(830, 680);
	const contracts = ["Tracking", "Bounty Hunter", "Retirement"];
	let startTime = Date.now(), activeConts = [], contBool = false, assignContsBool = true, dipBool = true, infBool = true;
	while (true) {
		activeConts = [];
		assignContsBool = true;
		dipBool = true;
		infBool = true;
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			if (ns.sleeve.getTask(i) == null) continue;
			if (ns.sleeve.getTask(i).actionType == "Contracts") { activeConts.push(ns.sleeve.getTask(i).actionName); }
		}
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			contBool = false;
			if ((ns.sleeve.getSleeve(i).hp.current / ns.sleeve.getSleeve(i).hp.max) < 0.5) { ns.sleeve.setToBladeburnerAction(i, "Hypberbolic Regeneration Chamber"); continue; }
			if (ns.sleeve.getTask(i) != null) {
				if (ns.sleeve.getTask(i).actionName == "Hyperbolic Regeneration Chamber" && ns.sleeve.getSleeve(i).hp.current < ns.sleeve.getSleeve(i).hp.max) continue;
				if (ns.sleeve.getTask(i).actionType == "Contracts") continue;
			}
			if (activeConts.length == 3) { assignContsBool = true; }
			if (assignContsBool) {
				for (const contract of contracts) {
					if (activeConts.includes(contract)) continue;
					ns.sleeve.setToBladeburnerAction(i, "Take on contracts", contract);
					activeConts.push(contract);
					contBool = true;
					break;
				}
				if (contBool) continue;
			}
			if (dipBool) { ns.sleeve.setToBladeburnerAction(i, "Diplomacy"); dipBool = false; continue; }
			if (infBool) { ns.sleeve.setToBladeburnerAction(i, "Infiltrate Synthoids"); infBool = false; continue; }
			ns.sleeve.setToBladeburnerAction(i, "Field Analysis");
		}
		ns.clearLog();
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			const steve = ns.sleeve.getSleeve(i);
			const action = ns.sleeve.getTask(i) == null ? "Idle" : ns.sleeve.getTask(i).actionName;
			ns.print("Steve " + i + " HP: " + steve.hp.current + " / " + steve.hp.max + " // Int: " + steve.skills.intelligence + " // Act: " + action);
		}
		ns.print("Time Elapsed: " + ns.tFormat(Date.now() - startTime));
		await ns.sleep(50);
	}
}
