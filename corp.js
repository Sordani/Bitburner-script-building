//Coffee and Party function
/** @param {NS} ns */
function coffeeParty(ns, agriName) {
	for (const city of ns.corporation.getDivision(agriName).cities) {
		const office = ns.corporation.getOffice(agriName, city);
		if (office.avgEne < 95) ns.corporation.buyCoffee(agriName, city)
		if (office.avgHAP < 95 || office.avgMor < 95) ns.corporation.throwParty(agriName, city, 500_000)
	}
}

//Check which action should be done at this point and do it
//Importantly none of these functions wait for a number of cycles on their own, rather they count cycles while letting the loop to work every cycle.
/** @param {NS} ns */
async function checkStage(ns, corpName, agriName, tobaccoName, cities, jobs, lvlUps, stage, boostStock, boostPhases ) {
	switch (stage[0]) {
		case 0:
			ns.print("initial purchases");
			startstuff(ns, corpName, agriName, cities, jobs, lvlUps, stage); // stage 0
			break;
		case 1:
			if (stage[1] == 0) ns.print("waiting for the employers stats to rise");
			employeeSatisfactionCheck(ns, agriName, cities); //stage 1
			break;
		case 2:
			if (stage[1] == 0) ns.print("Buying first production multiplier material batch");
			purchaseMaterials(ns, 0, cities, boostStock, boostPhases, stage); //stage 2
			break;
		case 3:
			if (stage[1] == 0) ns.print("Accepting the first investor offer");
			invest(ns, 1); //stage 3
			break;
		case 4:
			ns.print("Further upgrades");
			upgradeStuff(ns, lvlUps, agriName, cities, jobs, 1); //stage 4
			break;
		case 5:
			if (stage[1]==0)ns.print("Waiting for the employers stats to rise for the second time");
			employeeSatisfactionCheck(ns, agriName, cities); //stage 5
			break;
		case 6:
			if(stage[1]==0)ns.print("Buying secont production multiplier material batch");
			purchaseMaterials(ns, 1, cities, boostStock, boostPhases, stage); //stage 6
			break;
		case 7:
			if (stage[1]==0)ns.print("Reassign employees");
			reAssignEmployees(ns, agriName, cities, jobs); //stage 7
			break;
		case 8:
			if (stage[1]==0)ns.print("Accepting the second investor offer");
			invest(ns, 2); //stage 8
			break;
		case 9:
			ns.print("Last Agriculture upgrades");
			lastAGUpgrades(ns, agriName, cities, 0); //stage 9
			break;
		case 10:
			if (stage[1]==0)ns.print("Buying third production multiplier material batch");
			purchaseMaterials(ns, 2, cities, boostStock, boostPhases, stage); //stage 10
			break;
		case 11:
			if (stage[1]==0)ns.print("Expand to tobacco");
			expandToTobacco(ns, tobaccoName, cities, jobs, lvlUps); //stage 11
			break;
		case 12:
			//enter the main corp script below or remove/comment out ns.spawn if you don't have one
			ns.print("this is the part of the script that normally spawns the mid-endgame script. nothing happens right now.");
			//ns.spawn("corp.js");
	}
}

//Corp initialization. Creating the corp, expanding to agriculture and its' cities,
//hiring and assigning in thosecities and buying some upgrades
/** @param {NS} ns */
function startstuff(ns, corpName, agriName, cities, jobs, lvlUps, stage) {
	try { ns.corporation.createCorporation(corpName, false); } catch { }
	try { ns.corporation.createCorporation(corpName, true); } catch { }
	ns.corporation.expandIndustry("Agriculture", agriName);
	ns.corporation.unlockUpgrade("Smart Supply");

	for (let city of cities) {
		if (city != cities[5]) {
			ns.corporation.expandCity(agriName, city);
			ns.corporation.purchaseWarehouse(agriName, city);
		}
		ns.corporation.setSmartSupply(agriName, city, true);
		while (ns.corporation.hireEmployee(agriName, city)) { } //apparently this works
		for (let i = 0; i < 3; i++) {
			ns.corporation.setAutoJobAssignment(agriName, city, jobs[i], 1);
		}
		ns.corporation.sellMaterial(agriName, city, "Plants", "MAX", "MP");
		ns.corporation.sellMaterial(agriName, city, "Food", "MAX", "MP");
	}

	ns.corporation.hireAdVert(agriName);
	ns.corporation.levelUpgrade(lvlUps[0]);
	ns.corporation.levelUpgrade(lvlUps[2]);
	ns.corporation.levelUpgrade(lvlUps[3]);
	ns.corporation.levelUpgrade(lvlUps[4]);
	ns.corporation.levelUpgrade(lvlUps[5]);
	ns.corporation.levelUpgrade(lvlUps[0]);
	ns.corporation.levelUpgrade(lvlUps[2]);
	ns.corporation.levelUpgrade(lvlUps[3]);
	ns.corporation.levelUpgrade(lvlUps[4]);
	ns.corporation.levelUpgrade(lvlUps[5]);

	for (let i = 0; i < 2; i++) {
		for (let city of cities) {
			try { ns.corporation.upgradeWarehouse(agriName, city, 1); } catch { }
		}
	}
	stage[0] += 1;

}

//Purchase materials (or set purchase amounts to 0), the wanted amounts are saved in the materialPhases array
/** @param {NS} ns */
function purchaseMaterials(ns, phase, cities, boostStock, boostPhases, stage) {
	if (stage[1] == 0) {
		for (let city of cities) {
			for (let i = 0; i < 4; i++) {
				ns.corporation.buyMaterial(agriName, city, boostStock[i], boostPhases[phase][i] / 10);
			}
		}
		stage[1] += 1;
	}
	else {
		for (let city of cities) {
			for (let i = 0; i < 4; i++) {
				ns.corporation.buyMaterial(agriName, city, boostStock[i], 0);
			}
		}
		stage[0] += 1;
		stage[1] = 0;
	}
}

//Wait till the employee stats are high enough and then go to the next stage
/** @param {NS} ns */
function employeeSatisfactionCheck(ns, agriName, cities) {
	let avgs = [0, 0, 0];
	for (let city of cities) {
		avgs[0] += ns.corporation.getOffice(agriName, city).avgMor;
		avgs[1] += ns.corporation.getOffice(agriName, city).avgHap;
		avgs[2] += ns.corporation.getOffice(agriName, city).avgEne;
	}
	ns.clearLog();
	ns.print("waiting for employee stats to rise");
	ns.print("   avg morale: " + (avgs[0] / 6).toFixed(3) + "/97");
	ns.print("avg happiness: " + (avgs[1] / 6).toFixed(3) + "/97");
	ns.print("   avg energy: " + (avgs[2] / 6).toFixed(3) + "/97");
	stage[1]++;
	if (avgs[0] / 6 >= 97 && avgs[1] / 6 >= 97 && avgs[2] / 6 >= 97 && stage[1] > 0) { stage[0] += 1; stage[1] = 0; }
	if (Math.random() > 0.95) ns.openDevMenu();
}

//Reassigning the employess so that nobody works in R&D
/** @param {NS} ns */
function reAssignEmployees(ns, agriName, cities, jobs) {
	for (let city of cities) {
		ns.corporation.setAutoJobAssignment(agriName, city, jobs[4], 0);
		ns.corporation.setAutoJobAssignment(agriName, city, jobs[0], 3);
		ns.corporation.setAutoJobAssignment(agriName, city, jobs[1], 2);
		ns.corporation.setAutoJobAssignment(agriName, city, jobs[2], 2);
		ns.corporation.setAutoJobAssignment(agriName, city, jobs[3], 2);
	}
	stage[0]++;
	stage[1]=0;
}

//Accept investor offers after 10 cycles
/** @param {NS} ns */
function invest(ns, i) {
	if (stage[1] == 0) {
		ns.print("waiting for a bit, just in case the investors might give a bit more money");
	}
	//investor evaluation takes into account 10 cycles
	//and we want them to take into account the current high earning cycles,
	//not the old low earning cycles, so we'll wait for a bit
	if (stage[1] <= 10) {
		ns.print("waiting cycles: " + stage[1] + "/10. investors are currently offering: " + ns.formatNumber(ns.corporation.getInvestmentOffer().funds, "0.00a"));
		stage[1] += 1;
	}
	else {
		ns.tprint("investment offer round " + i + ": " + ns.formatNumber(ns.corporation.getInvestmentOffer().funds, "0.00a"));
		ns.corporation.acceptInvestmentOffer();
		stage[0] += 1;
		stage[1] = 0;
	}
}

//buy more upgrades, office space, and warehouse space
/** @param {NS} ns */
function upgradeStuff(ns, lvlUps, agriName, cities, jobs) {
	try { ns.corporation.levelUpgrade(lvlUps[1]); } catch { }
	try { ns.corporation.levelUpgrade(lvlUps[1]); } catch { } 
	for (let i = 0; i < 8; i++) {
		try { ns.corporation.levelUpgrade(lvlUps[0]); } catch { }
		try { ns.corporation.levelUpgrade(lvlUps[1]); } catch { }
	}
	for (let i = 0; i < 2; i++) {
		for (let city of cities) {
			try {
				ns.corporation.upgradeOfficeSize(agriName, city, 3);
				while (ns.corporation.hireEmployee(agriName, city)) { };
				ns.corporation.setAutoJobAssignment(agriName, city, jobs[0], 1);
				ns.corporation.setAutoJobAssignment(agriName, city, jobs[1], 1);
				ns.corporation.setAutoJobAssignment(agriName, city, jobs[2], 1);
				ns.corporation.setAutoJobAssignment(agriName, city, jobs[3], 1);
				ns.corporation.setAutoJobAssignment(agriName, city, jobs[4], 5);
			} catch { }
		}
	}

	for (let i = 0; i < 7; i++) {
		for (let city of cities) {
			try { ns.corporation.upgradeWarehouse(agriName, city, 1); } catch { }
		}
	}
	stage[0] += 1;
	stage[1] = 0;
}

//Buy last upgrades for Agriculture
/** @param {NS} ns */
function lastAGUpgrades(ns, agriName, cities){
	for (let i = 0; i < 9; i++) {
		for (let city of cities) {
			try { ns.corporation.upgradeWarehouse(agriName, city, 1); } catch { }
		}
	}
	stage[0] += 1;
	stage[1] = 0;
}

//Expand to tobacco division and its' cities, set employee positions, start the first product's development, and buy some more upgrades
/** @param {NS} ns */
function expandToTobacco(ns, tobaccoName, cities, jobs, lvlUps) {
	try { ns.corporation.expandIndustry("Tobacco", tobaccoName); } catch { ns.tprint("Couldn't expand.. no money"); ns.exit(); }
	ns.corporation.expandCity(tobaccoName, cities[0]);
	ns.corporation.purchaseWarehouse(tobaccoName, cities[0]);
	try {
		for (let i = 0; i < 9; i++) {
			ns.corporation.upgradeOfficeSize(tobaccoName, cities[0], 3);
			while (ns.corporation(tobaccoName, cities[0])) { }
			ns.corporation.setAutoJobAssignment(tobaccoName, cities[0], jobs[0], Math.floor(ns.corporation.getOffice(tobaccoName, cities[0]).employees.length / 3.5));
			ns.corporation.setAutoJobAssignment(tobaccoName, cities[0], jobs[1], Math.floor(ns.corporation.getOffice(tobaccoName, cities[0]).employees.length / 3.5));
			ns.corporation.setAutoJobAssignment(tobaccoName, cities[0], jobs[2], Math.floor(0.5 * ns.corporation.getOffice(tobaccoName, cities[0]).employees.length / 3.5));
			ns.corporation.setAutoJobAssignment(tobaccoName, cities[0], jobs[3], Math.ceil(ns.corporation.getOffice(tobaccoName, cities[0]).employees.length / 3.5));
		}
	} catch { }

	for (let i = 0; i < 2; i++) {
		for (let city of cities) {
			if (city == cities[0]) continue;
			try {
				ns.corporation.expandCity(tobaccoName, city);
				ns.corporation.purchaseWarehouse(tobaccoName, city);
			} catch { }
			ns.corporation.upgradeOfficeSize(tobaccoName, city, 3);
			while (ns.corporation.hireEmployee(tobaccoName, city)) { }
			ns.corporation.setAutoJobAssignment(tobaccoName, city, jobs[0], 1);
			ns.corporation.setAutoJobAssignment(tobaccoName, city, jobs[1], 1);
			ns.corporation.setAutoJobAssignment(tobaccoName, city, jobs[2], 1);
			ns.corporation.setAutoJobAssignment(tobaccoName, city, jobs[3], 1);
			ns.corporation.setAutoJobAssignment(tobaccoName, city, jobs[4], 5);
		}
	}

	ns.corporation.makeProduct(tobaccoName, cities[0], "Tobacco v1", 1e9, 1e9);
	try {
		for (let i = 2; i < 6; i++) {
			ns.corporation.levelUpgrade("DreamSense");
		}
	} catch { }
	try {
		for (let i = 2; i < 6; i++) {
			while (ns.corporation.getUpgradeLevel(lvlUps[i]) < 20) {
				ns.corporation.levelUpgrade(lvlUps[i]);
			}
		}
	} catch { }
	try {
		for (let i = 0; i < 10; i++) {
			ns.corporation.levelUpgrade("project Insight");
		}
	} catch { }

	stage[0] += 1;
}

/** @param {NS} ns */
export async function main(ns) {

	const corpName = "TerraCorp";
	const agriName = "AgriCorp";
	const tobaccoName = "CamelCorp";

	const jobs = ["Operations", "Engineer", "Business", "Management", "Research & Development"];
	const boostStock = ["Hardware", "Robots", "AI Cores", "Real Estate"];
	const lvlUps = ["Smart Factories", "Smart Storage", "FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants", "Wilson Analytics"];
	const cities = ["Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven", "Sector-12"];

	//Hardware, Robots, AI Cores, and Real Estate Numbers. tinkering expected
	const boostPhases = [
		[125, 0, 75, 27000],
		[2675, 96, 2445, 119400],
		[6500, 630, 3750, 84000]
	]
	let stage = [0, 0]; //stage, step

	await checkStage(ns, corpName, agriName, tobaccoName, cities, jobs, lvlUps, stage, boostStock, boostPhases); //function to figure out what stage/stage the corp is at

	while (true) {
		while (ns.corporation.getCorporation().state != "EXPORT") {
			//when you make your main script, put things you want to be done
			//potentially multiple times every cycle, like buying upgrades, here.
			await ns.sleep(0);
		}

		while (ns.corporation.getCorporation().state == "EXPORT") {
			//same as above
			await ns.sleep(0);
		}
		//and to this part put things you want done exactly once per cycle
		coffeeParty(ns, agriName);
		await checkStage(ns, corpName, agriName, tobaccoName, cities, jobs, lvlUps, stage, boostStock, boostPhases);
	}


}
