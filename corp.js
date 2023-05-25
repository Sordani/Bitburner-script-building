export class Business {
	/**@type {NS} */
	ns
	corpName
	agriName
	tobaccoName
	jobs
	boostStock
	lvlUps
	cities
	boostPhases
	stage
	constructor(ns) {
		/**@type {NS} */
		this.ns = ns;
		this.corpName = "TerraCorp";
		this.agriName = "AgriCorp";
		this.tobaccoName = "CamelCorp";

		this.jobs = ["Operations", "Engineer", "Business", "Management", "Research & Development"];
		this.boostStock = ["Hardware", "Robots", "AI Cores", "Real Estate"];
		this.lvlUps = ["Smart Factories", "Smart Storage", "FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants", "Wilson Analytics"];
		this.cities = ["Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven", "Sector-12"];

		//Hardware, Robots, AI Cores, and Real Estate Numbers. tinkering expected
		this.boostPhases = [
			[125, 0, 75, 27000],
			[2675, 96, 2445, 119400],
			[6500, 630, 3750, 84000]
		]
		this.stage = [0, 0]; //stage, step
	}

	//Coffee and Party function
	coffeeParty() {
		for (const city of this.ns.corporation.getDivision(this.agriName).cities) {
			const office = this.ns.corporation.getOffice(this.agriName, city);
			if (office.avgEne < 95) this.ns.corporation.buyCoffee(this.agriName, city)
			if (office.avgHAP < 95 || office.avgMor < 95) this.ns.corporation.throwParty(this.agriName, city, 500_000)
		}
	}

	//Check which action should be done at this point and do it
	//Importantly none of these functions wait for a number of cycles on their own, rather they count cycles while letting the loop to work every cycle.
	/** @param {NS} ns */
	checkStage() {
		switch (this.stage[0]) {
			case 0:
				this.ns.print("initial purchases");
				this.startstuff(); // stage 0
				break;
			case 1:
				if (this.stage[1] == 0) this.ns.print("waiting for the employers stats to rise");
				this.employeeSatisfactionCheck(); //stage 1
				break;
			case 2:
				if (this.stage[1] == 0) this.ns.print("Buying first production multiplier material batch");
				this.purchaseMaterials(0); //stage 2
				break;
			case 3:
				if (this.stage[1] == 0) this.ns.print("Accepting the first investor offer");
				this.invest(1); //stage 3
				break;
			case 4:
				this.ns.print("Further upgrades");
				this.upgradeStuff(1); //stage 4
				break;
			case 5:
				if (this.stage[1] == 0) this.ns.print("Waiting for the employers stats to rise for the second time");
				this.employeeSatisfactionCheck(); //stage 5
				break;
			case 6:
				if (this.stage[1] == 0) this.ns.print("Buying secont production multiplier material batch");
				this.purchaseMaterials(1); //stage 6
				break;
			case 7:
				if (this.stage[1] == 0) this.ns.print("Reassign employees");
				this.reAssignEmployees(); //stage 7
				break;
			case 8:
				if (this.stage[1] == 0) this.ns.print("Accepting the second investor offer");
				this.invest(2); //stage 8
				break;
			case 9:
				this.ns.print("Last Agriculture upgrades");
				this.lastAGUpgrades(); //stage 9
				break;
			case 10:
				if (this.stage[1] == 0) this.ns.print("Buying third production multiplier material batch");
				this.purchaseMaterials(2); //stage 10
				break;
			case 11:
				if (this.stage[1] == 0) this.ns.print("Expand to tobacco");
				this.expandToTobacco(); //stage 11
				break;
			case 12:
				//enter the main corp script below or remove/comment out ns.spawn if you don't have one
				this.ns.print("this is the part of the script that normally spawns the mid-endgame script. nothing happens right now.");
			//ns.spawn("corp.js");
		}
	}

	//Corp initialization. Creating the corp, expanding to agriculture and its' cities,
	//hiring and assigning in thosecities and buying some upgrades
	startstuff() {
		try { this.ns.corporation.createCorporation(this.corpName, false); } catch { }
		try { this.ns.corporation.createCorporation(this.corpName, true); } catch { }
		this.ns.corporation.expandIndustry("Agriculture", this.agriName);
		this.ns.corporation.unlockUpgrade("Smart Supply");

		for (let city of this.cities) {
			if (city != this.cities[5]) {
				this.ns.corporation.expandCity(this.agriName, city);
				this.ns.corporation.purchaseWarehouse(this.agriName, city);
			}
			this.ns.corporation.setSmartSupply(this.agriName, city, true);
			while (this.ns.corporation.hireEmployee(this.agriName, city)) { } //apparently this works
			for (let i = 0; i < 3; i++) {
				this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[i], 1);
			}
			this.ns.corporation.sellMaterial(this.agriName, city, "Plants", "MAX", "MP");
			this.ns.corporation.sellMaterial(this.agriName, city, "Food", "MAX", "MP");
		}

		this.ns.corporation.hireAdVert(this.agriName);
		const lvlOrder = [0, 2, 3, 4, 5, 0, 2, 3, 4, 5];
		for (let i = 0; i < 10; i++) { this.ns.corporation.levelUpgrade(this.lvlUps[lvlOrder[i]]); } //hopefully this equals below
		/*this.ns.corporation.levelUpgrade(this.lvlUps[0]);
		this.ns.corporation.levelUpgrade(this.lvlUps[2]);
		this.ns.corporation.levelUpgrade(this.lvlUps[3]);
		this.ns.corporation.levelUpgrade(this.lvlUps[4]);
		this.ns.corporation.levelUpgrade(this.lvlUps[5]);
		this.ns.corporation.levelUpgrade(this.lvlUps[0]);
		this.ns.corporation.levelUpgrade(this.lvlUps[2]);
		this.ns.corporation.levelUpgrade(this.lvlUps[3]);
		this.ns.corporation.levelUpgrade(this.lvlUps[4]);
		this.ns.corporation.levelUpgrade(this.lvlUps[5]);*/

		for (let i = 0; i < 2; i++) {
			for (let city of this.cities) {
				try { this.ns.corporation.upgradeWarehouse(this.agriName, city, 1); } catch { }
			}
		}
		this.stage[0] += 1;

	}

	//Purchase materials (or set purchase amounts to 0), the wanted amounts are saved in the materialPhases array
	purchaseMaterials(phase) {
		if (this.stage[1] == 0) {
			for (let city of this.cities) {
				for (let i = 0; i < 4; i++) {
					this.ns.corporation.buyMaterial(this.agriName, city, this.boostStock[i], this.boostPhases[phase][i] / 10);
				}
			}
			this.stage[1] += 1;
		}
		else {
			for (let city of this.cities) {
				for (let i = 0; i < 4; i++) {
					this.ns.corporation.buyMaterial(this.agriName, city, this.boostStock[i], 0);
				}
			}
			this.stage[0] += 1;
			this.stage[1] = 0;
		}
	}

	//Wait till the employee stats are high enough and then go to the next stage
	employeeSatisfactionCheck() {
		let avgs = [0, 0, 0];
		for (let city of this.cities) {
			avgs[0] += this.ns.corporation.getOffice(this.agriName, city).avgMor;
			avgs[1] += this.ns.corporation.getOffice(this.agriName, city).avgHap;
			avgs[2] += this.ns.corporation.getOffice(this.agriName, city).avgEne;
		}
		this.ns.clearLog();
		this.ns.print("waiting for employee stats to rise");
		this.ns.print("   avg morale: " + (avgs[0] / 6).toFixed(3) + "/97");
		this.ns.print("avg happiness: " + (avgs[1] / 6).toFixed(3) + "/97");
		this.ns.print("   avg energy: " + (avgs[2] / 6).toFixed(3) + "/97");
		this.stage[1]++;
		if (avgs[0] / 6 >= 97 && avgs[1] / 6 >= 97 && avgs[2] / 6 >= 97 && this.stage[1] > 0) { this.stage[0] += 1; this.stage[1] = 0; }
		if (Math.random() > 0.95) this.ns.openDevMenu();
	}

	//Reassigning the employess so that nobody works in R&D
	reAssignEmployees() {
		for (let city of this.cities) {
			this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[4], 0);
			this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[0], 3);
			this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[1], 2);
			this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[2], 2);
			this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[3], 2);
		}
		this.stage[0]++;
		this.stage[1] = 0;
	}

	//Accept investor offers after 10 cycles
	invest(i) {
		if (this.stage[1] == 0) {
			this.ns.print("waiting for a bit, just in case the investors might give a bit more money");
		}
		//investor evaluation takes into account 10 cycles
		//and we want them to take into account the current high earning cycles,
		//not the old low earning cycles, so we'll wait for a bit
		if (this.stage[1] <= 10) {
			this.ns.print("waiting cycles: " + this.stage[1] + "/10. investors are currently offering: " + this.ns.formatNumber(this.ns.corporation.getInvestmentOffer().funds, "0.00a"));
			this.stage[1] += 1;
		}
		else {
			this.ns.tprint("investment offer round " + i + ": " + this.ns.formatNumber(this.ns.corporation.getInvestmentOffer().funds, "0.00a"));
			this.ns.corporation.acceptInvestmentOffer();
			this.stage[0] += 1;
			this.stage[1] = 0;
		}
	}

	//buy more upgrades, office space, and warehouse space
	upgradeStuff() {
		try { this.ns.corporation.levelUpgrade(this.lvlUps[1]); } catch { }
		try { this.ns.corporation.levelUpgrade(this.lvlUps[1]); } catch { }
		for (let i = 0; i < 8; i++) {
			try { this.ns.corporation.levelUpgrade(this.lvlUps[0]); } catch { }
			try { this.ns.corporation.levelUpgrade(this.lvlUps[1]); } catch { }
		}
		for (let i = 0; i < 2; i++) {
			for (let city of this.cities) {
				try {
					this.ns.corporation.upgradeOfficeSize(this.agriName, city, 3);
					while (this.ns.corporation.hireEmployee(this.agriName, city)) { };
					const jobAssign = [1, 1, 1, 1, 5];
					for (let i = 0; i < jobAssign.length; i++); { this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[i], jobAssign[i]);	}
				} catch { }
			}
		}

		for (let i = 0; i < 7; i++) {
			for (let city of this.cities) {
				try { this.ns.corporation.upgradeWarehouse(this.agriName, city, 1); } catch { }
			}
		}
		this.stage[0] += 1;
		this.stage[1] = 0;
	}

	//Buy last upgrades for Agriculture
	lastAGUpgrades() {
		for (let i = 0; i < 9; i++) {
			for (let city of this.cities) {
				try { ns.corporation.upgradeWarehouse(this.agriName, city, 1); } catch { }
			}
		}
		this.stage[0] += 1;
		this.stage[1] = 0;
	}

	//Expand to tobacco division and its' cities, set employee positions, start the first product's development, and buy some more upgrades
	expandToTobacco() {
		try { this.ns.corporation.expandIndustry("Tobacco", this.tobaccoName); } catch { this.ns.tprint("Couldn't expand.. no money"); ns.exit(); }
		this.ns.corporation.expandCity(this.tobaccoName, this.cities[0]);
		this.ns.corporation.purchaseWarehouse(this.tobaccoName, this.cities[0]);
		try {
			for (let i = 0; i < 9; i++) {
				this.ns.corporation.upgradeOfficeSize(this.tobaccoName, this.cities[0], 3);
				while (this.ns.corporation(this.tobaccoName, this.cities[0])) { }
				this.ns.corporation.setAutoJobAssignment(this.tobaccoName, this.cities[0], this.jobs[0], Math.floor(this.ns.corporation.getOffice(this.tobaccoName, this.cities[0]).employees / 3.5));
				this.ns.corporation.setAutoJobAssignment(this.tobaccoName, this.cities[0], this.jobs[1], Math.floor(this.ns.corporation.getOffice(this.tobaccoName, this.cities[0]).employees / 3.5));
				this.ns.corporation.setAutoJobAssignment(this.tobaccoName, this.cities[0], this.jobs[2], Math.floor(0.5 * this.ns.corporation.getOffice(this.tobaccoName, this.cities[0]).employees / 3.5));
				this.ns.corporation.setAutoJobAssignment(this.tobaccoName, this.cities[0], this.jobs[3], Math.ceil(this.ns.corporation.getOffice(this.tobaccoName, this.cities[0]).employees / 3.5));
			}
		} catch { }

		for (let i = 0; i < 2; i++) {
			for (let city of this.cities) {
				if (city == this.cities[0]) continue;
				try {
					this.ns.corporation.expandCity(this.tobaccoName, city);
					this.ns.corporation.purchaseWarehouse(this.tobaccoName, city);
				} catch { }
				this.ns.corporation.upgradeOfficeSize(this.tobaccoName, city, 3);
				while (this.ns.corporation.hireEmployee(this.tobaccoName, city)) { }
				const jobAssign = [1, 1, 1, 1, 5];
				for (let i = 0; i < jobAssign.length; i++); { this.ns.corporation.setAutoJobAssignment(this.tobaccoName, city, this.jobs[i], jobAssign[i]);	}
			}
		}

		this.ns.corporation.makeProduct(this.tobaccoName, this.cities[0], "Tobacco v1", 1e9, 1e9);
		try {
			for (let i = 2; i < 6; i++) {
				this.ns.corporation.levelUpgrade("DreamSense");
			}
		} catch { }
		try {
			for (let i = 2; i < 6; i++) {
				while (this.ns.corporation.getUpgradeLevel(this.lvlUps[i]) < 20) {
					this.ns.corporation.levelUpgrade(this.lvlUps[i]);
				}
			}
		} catch { }
		try {
			for (let i = 0; i < 10; i++) {
				this.ns.corporation.levelUpgrade("project Insight");
			}
		} catch { }

		this.stage[0] += 1;
	}

}


/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();
	const bus = new Business(ns);
	bus.checkStage(); //function to figure out what stage/stage the corp is at

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
		bus.coffeeParty();
		bus.checkStage();
	}


}
