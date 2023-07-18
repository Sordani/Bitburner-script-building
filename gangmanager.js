/** @param {NS} ns */
export class MobBoss {
	/**@type {NS} */
	ns
	startTime
	tick
	m
	mobFaction
	mobInfo
	names
	enemyMobs
	clashDefThresh
	clashBool
	qmInfo
	targetValue
	constructor(ns) {
		/**@type {NS} */
		this.ns = ns;
		this.startTime = Date.now();
		this.tick = { foundBool: false, bool: false, otherMobsCycle: undefined, timer: 18000, countdown: undefined, increment: 0 };
		this.m = ns.gang;
		this.warBool = true;
		this.mobFaction = "Slum Snakes";
		this.mobInfo;
		this.names = [ //Black Prism Characters, the Mighty
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
		this.enemyMobs = { bool: true, data: undefined };
		this.clashDefThresh = 600; //minimum defense required to territory warfare if clashing
		this.clashBool = false;
		this.qmInfo = { buyBool: true, cycleThresh: 3, cycles: 0, tickSnapShot: 0 };
		this.targetValue = 200; //stat threshold to stop training. candidate for adjustment.
	}

	startMob() {
		if (!this.m.inGang() && this.ns.getPlayer().factions.includes(this.mobFaction)) { this.m.createGang(this.mobFaction); }
	}

	mobCommand() {
		this.startMob();
		if (this.enemyMobs.bool) { this.enemyMobs.data = this.ns.gang.getOtherGangInformation(); this.enemyMobs.bool = false; }
		this.mobRecruiter();
		this.mobInfo = this.m.getGangInformation();
		this.tickTracker();
		this.taskManager();
		this.mobQuartermaster();
		this.mobPromotion();
		this.mobWarHandler();
		this.mobPrint();
	}

	//keeps track of when the special moment of recalculating otherGang power is.
	tickTracker() {
		if (this.tick.foundBool) { //happens after we find the tick the first ime.
			if (this.tick.bool) {
				if (this.enemyMobs.data == this.m.getOtherGangInformation()) { return; }
				this.enemyMobs.data = this.m.getOtherGangInformation();
				this.tick.bool = false;
				this.tick.countdown = Date.now() + this.tick.timer;
				this.tick.increment++
			}
			if (Date.now() >= this.tick.countdown) {
				this.tick.bool = true;
			}
		} else { //looking for the tick and setting the timer the first time.
			if (this.enemyMobs.data != this.ns.gang.getOtherGangInformation()) {
				this.tick.foundBool = true;
				this.tick.countdown = Date.now() + this.tick.timer;
			}
		}
	}

	//assigns tasks to gangmembers
	taskManager() {
		if (this.tick.bool) {
			for (const member of this.m.getMemberNames()) {
				if (this.m.getMemberInformation(member).def < this.clashDefThresh && this.clashBool) continue;
				this.m.setMemberTask(member, "Territory Warfare");
			}
		} else {
			for (const member of this.m.getMemberNames()) {
				const memberData = this.m.getMemberInformation(member);
				const jobObj = [];
				if (memberData.str < this.targetValue * memberData.str_asc_mult
					|| memberData.agi < this.targetValue * memberData.agi_asc_mult
					|| memberData.def < this.targetValue * memberData.def_asc_mult
					|| memberData.dex < this.targetValue * memberData.dex_asc_mult) {
					this.m.setMemberTask(member, "Train Combat");
					continue;
				}
				for (const job of this.m.getTaskNames()) {
					const jobStats = this.m.getTaskStats(job),
						wantedGain = this.ns.formulas.gang.wantedLevelGain(this.mobInfo, memberData, jobStats),
						respectGain = this.ns.formulas.gang.respectGain(this.mobInfo, memberData, jobStats),
						moneyGain = this.ns.formulas.gang.moneyGain(this.mobInfo, memberData, jobStats);
					jobObj.push({ name: job, wantedGain, respectGain, moneyGain });
				}
				jobObj.sort((a, b) => a.respectGain < b.respectGain ? 1 : -1);
				if (this.mobInfo.respect >= 2e6 && 1 - this.mobInfo.wantedPenalty < 0.05) {
					jobObj.sort((a, b) => a.moneyGain < b.moneyGain ? 1 : -1);
				}
				for (const job of jobObj) {
					if (job.respectGain < job.wantedGain * 99) continue;
					this.m.setMemberTask(member, job.name);
					break;
				}
			}
		}
	}

	//recruits gang members if possibe
	mobRecruiter() {
		for (const name of this.m.getMemberNames()) {
			if (this.names.includes(name)) { this.names.splice(this.names.indexOf(name), 1); }
		}
		if (this.m.canRecruitMember()) {
			const gangName = this.names[Math.floor(Math.random() * this.names.length)];
			this.m.recruitMember(gangName);
		}
	}

	//buys equipment based on affording it for an extended period of time
	//so the rest of what you might be doing in a bitnode won't be inhibited too much
	mobQuartermaster() {
		const money = this.ns.getPlayer().money;
		const nextPurchase = this.mobWishList();
		if (nextPurchase.length === 0) { return; }
		if (this.m.getEquipmentCost(nextPurchase[0]) > money) {
			this.qmInfo.bool = false;
			this.qmInfo.cycles = 0;
		}
		if (this.tick.increment > this.qmInfo.tickSnapShot) {
			this.qmInfo.cycles++;
			this.qmInfo.tickSnapShot = this.tick.increment;
		}
		if (this.qmInfo.cycles >= this.qmInfo.cycleThresh) {
			this.qmInfo.bool = true;
		}
		if (!this.qmInfo.bool) { return; }
		this.m.purchaseEquipment(nextPurchase[1], nextPurchase[0]);
	}

	//returns an array [equipmentName, gangMemberName] for next cheapest purchase 
	//for mobQuartermaster()
	mobWishList() {
		let wishList = [];
		let nameList = [];
		for (const member of this.m.getMemberNames()) {
			const have = this.m.getMemberInformation(member).upgrades;
			const wantList = [];
			for (const equip of this.m.getEquipmentNames()) {
				if (have.includes(equip)) continue;
				wantList.push(equip);
			}
			let equip, aug;
			let augBool = false, equipBool = false;
			for (const item of wantList) {
				if (augBool && equipBool) { break; }
				const itemType = this.m.getEquipmentType(item);
				if (itemType == "Augment" && !augBool) {
					aug = item;
					augBool = true;
					continue;
				}
				if (itemType == "Equipment" && !equipBool) {
					equip = item;
					equipBool = true;
					continue;
				}
			}
			if (!aug && !equip) { continue; }
			if (this.m.getEquipmentCost(aug) < (this.m.getEquipmentCost(equip) * 3) && aug) {
				wishList.push(aug);
				nameList.push(member);
			} else if (equip) {
				wishList.push(equip);
				nameList.push(member);
			} else {
				continue;
			}
		}
		let cheapestUpgrade = [];
		for (let i = 0; i < wishList.length; i++) {
			if (cheapestUpgrade.length === 0) {
				cheapestUpgrade.unshift(wishList[i]);
				cheapestUpgrade.push(nameList[i]);
				continue;
			}
			if (this.m.getEquipmentCost(cheapestUpgrade[0]) > this.m.getEquipmentCost(wishList[i])) {
				cheapestUpgrade = [];
				cheapestUpgrade.unshift(wishList[i]);
				cheapestUpgrade.push(nameList[i]);
			}
		}
		return cheapestUpgrade;
	}

	//determines when members ascend
	mobPromotion() {
		for (const member of this.m.getMemberNames()) {
			const memberData = this.m.getMemberInformation(member);
			if (this.m.getAscensionResult(member) === undefined) { continue; }
			if (memberData.str_exp < 1000) { continue; }
			if (this.m.getAscensionResult(member).str >= 1.5) {
				this.m.ascendMember(member);
			}
		}
	}

	//handles War
	mobWarHandler() {
		this.warBool = true;
		if (this.m.getMemberNames().length < 8) { this.warBool = false; }
		for (const [name, gang] of Object.entries(this.m.getOtherGangInformation())) { //thank jakob for this
			if (name == this.mobInfo.faction) { continue; }
			if (this.m.getChanceToWinClash(name) < 0.55) { this.warBool = false; }
		}
		this.ns.gang.setTerritoryWarfare(this.warBool && this.mobInfo.territory < 1);
		this.clashBool = (this.warBool && this.mobInfo.territory < 1);
	}

	//logmanager
	mobPrint() {
		this.ns.clearLog();
		this.ns.print("runTime:");
		this.ns.print(this.ns.tFormat(Date.now() - this.startTime));
		this.ns.print("money generated:");
		this.ns.print(this.ns.formatNumber(this.ns.getMoneySources().sinceStart.gang));
		this.ns.print("tick object:");
		this.ns.print(JSON.stringify(this.tick));
		this.ns.print("warBool:");
		this.ns.print(this.warBool);
		this.ns.print("enemyMobs:");
		this.ns.print(JSON.stringify(this.enemyMobs));
	}
}

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();
	const mob = new MobBoss(ns);
	while (true) {
		mob.mobCommand();
		await ns.sleep(0);
	}

}
