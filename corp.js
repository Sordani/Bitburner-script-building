export class Business {
  /**@type {NS} */
  ns
  corpName
  agriName
  tobaccoName
  investNum
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
    this.investNum = 1;

    this.jobs = ["Operations", "Engineer", "Business", "Management", "Research & Development"];
    this.boostStock = ["Hardware", "Robots", "AI Cores", "Real Estate"];
    this.lvlUps = ["Smart Factories", "Smart Storage", "FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants", "Wilson Analytics", "Project Insight"];
    this.cities = ["Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven", "Sector-12"];

    //Hardware, Robots, AI Cores, and Real Estate Numbers. tinkering expected
    this.boostPhases = [
      [1080, 0, 1201, 74388],
      [2675, 96, 2445, 119400],
      [6500, 630, 3750, 84000]
    ]
    this.stage = [0, 0]; //stage, step
  }

  //Tea and Party function
  teaParty() {
    for (const division of this.ns.corporation.getCorporation().divisions) {
      for (const city of this.ns.corporation.getDivision(division).cities) {
        const office = this.ns.corporation.getOffice(division, city);
        if (office.avgEnergy < 98) { this.ns.corporation.buyTea(division, city); }
        if (office.avgMorale < 98) { this.ns.corporation.throwParty(division, city, 500_000); }
      }
    }
  }

  //sets stage to appropriate step
  setStage() {
    //this.stage should be incremented based on existing data checks.
    switch (this.stage[0]) {
      case 0:
        break;
      case 1:
        break;
      case 2:
        break;
      case 3:
        break;
      case 4:
        break;
      case 5:
        break;
      case 6:
        break;
      case 7:
        break;
      case 8:
        break;
      case 9:
        break;
      case 10:
        break;
      case 11:
        break;
      case 12:
        break;
    }
  }

  //Check which action should be done at this point and do it
  //Importantly none of these functions wait for a number of cycles on their own, rather they count cycles while letting the loop to work every cycle.
  /** @param {NS} ns */
  checkStage() {
    //this.setStage();
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
        this.invest(this.investNum); //stage 3 //1st investor offer is around 310 billion
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
        if (this.stage[1] == 0) this.ns.print("Buying second production multiplier material batch");
        this.purchaseMaterials(1); //stage 6
        break;
      case 7:
        if (this.stage[1] == 0) this.ns.print("Reassign employees");
        this.reAssignEmployees(1); //stage 7
        break;
      case 8:
        if (this.stage[1] == 0) this.ns.print("Accepting the second investor offer");
        this.investNum++;
        this.invest(this.investNum); //stage 8
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
        break;
    }
  }

  //Corp initialization. Creating the corp, expanding to agriculture and its' cities,
  //hiring and assigning in thosecities and buying some upgrades
  startstuff() {
    if (!this.ns.corporation.hasCorporation()) { try { this.ns.corporation.createCorporation(this.corpName, false); } catch { this.ns.print("not in bitnode 3, attempting to self-fund"); } }
    if (!this.ns.corporation.hasCorporation()) { try { this.ns.corporation.createCorporation(this.corpName); } catch { this.ns.print("self funding failed, requires 150 billion in cash available."); this.ns.exit(); } }
    this.stage[1] = 1;
    if (!this.ns.corporation.getCorporation().divisions.includes(this.agriName)) { this.ns.corporation.expandIndustry("Agriculture", this.agriName); }
    this.stage[1] = 2;
    if (!this.ns.corporation.hasUnlock("Smart Supply")) { this.ns.corporation.purchaseUnlock("Smart Supply"); }
    this.stage[1] = 3;
    for (let city of this.cities) {
      if (!this.ns.corporation.getDivision(this.agriName).cities.includes(city)) { this.ns.corporation.expandCity(this.agriName, city); }
      if (!this.ns.corporation.hasWarehouse(this.agriName, city)) { this.ns.corporation.purchaseWarehouse(this.agriName, city); }
      this.ns.corporation.setSmartSupply(this.agriName, city, true);
      while (this.ns.corporation.hireEmployee(this.agriName, city)) { } //hires employee and returns true. empty brackets simply makes it test the statement immediately again.
      this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[4], 3);
      this.ns.corporation.sellMaterial(this.agriName, city, "Plants", "MAX", "MP");
      this.ns.corporation.sellMaterial(this.agriName, city, "Food", "MAX", "MP");
    }
    for (let i = 0; i < 2; i++) {
      this.ns.corporation.hireAdVert(this.agriName);
    }
    /*const lvlOrder = [0, 2, 3, 4, 5, 0, 2, 3, 4, 5];
    for (let i = 0; i < 10; i++) { this.ns.corporation.levelUpgrade(this.lvlUps[lvlOrder[i]]); }
    */ //don't buy useless upgrades?
    for (let i = 0; i < 3; i++) { this.ns.corporation.levelUpgrade(this.lvlUps[1]); }
    for (let city of this.cities) { this.ns.corporation.upgradeWarehouse(this.agriName, city, 4); }

    this.stage[0] += 1;
    this.stage[1] = 0;

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
    this.ns.clearLog();
    for (const division of this.ns.corporation.getCorporation().divisions) {
      const avgs = [0, 0];
      this.ns.print("   " + division);
      this.ns.print("");
      for (const city of this.ns.corporation.getDivision(division).cities) {
        avgs[0] += this.ns.corporation.getOffice(division, city).avgMorale;
        avgs[1] += this.ns.corporation.getOffice(division, city).avgEnergy;
      }
      this.ns.print("   avg morale: " + (avgs[0] / 6).toFixed(3) + "/98");
      this.ns.print("   avg energy: " + (avgs[1] / 6).toFixed(3) + "/98");
      this.stage[1]++;
    }
    if (avgs[0] / 6 >= 98 && avgs[1] / 6 >= 98 && this.stage[1] > 0) {
      if (this.stage[0] == 1) {
        for (let city of this.cities) {
          this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[4], 0);
          this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[0], 1);
          this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[1], 1);
          this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[2], 1);
        }
      } /*else if (this.stage[0] == 5) {
        const lvlOrder = [0, 2, 3, 4, 5, 0, 2, 3, 4, 5, 7]; //added 7 for wilson analytics
        for (let i = 0; i < 10; i++) { this.ns.corporation.levelUpgrade(this.lvlUps[lvlOrder[i]]); }
        //moved this from startstuff here prior to 2nd investment
      } */ //not enough money anywhere for these upgrades
      this.stage[0] += 1; this.stage[1] = 0;
    }
  }

  //Reassigning the employess so that nobody works in R&D
  reAssignEmployees() {
    for (let city of this.cities) {
      this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[4], 0);
      this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[0], 3);
      this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[1], 2);
      this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[2], 2);
      this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[3], 2);
      this.ns.corporation.upgradeWarehouse(this.agriName, city);
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
    if (this.stage[1] <= 15) {
      this.ns.print("waiting cycles: " + this.stage[1] + "/15. investors are currently offering: " + this.ns.formatNumber(this.ns.corporation.getInvestmentOffer().funds, 3));
      this.stage[1] += 1;
    }
    else if (this.ns.corporation.getCorporation().state != "PURCHASE") { ns.sleep(0); }
    else {
      this.ns.tprint("investment offer round " + i + ": " + this.ns.formatNumber(this.ns.corporation.getInvestmentOffer().funds, 3));
      this.ns.corporation.acceptInvestmentOffer();
      this.stage[0] += 1;
      this.stage[1] = 0;
    }
  }

  //buy more upgrades, office space, and warehouse space
  upgradeStuff() {
    this.ns.corporation.levelUpgrade(this.lvlUps[7]);
    this.ns.corporation.levelUpgrade(this.lvlUps[1]);
    this.ns.corporation.levelUpgrade(this.lvlUps[1]);
    for (let i = 0; i < 8; i++) {
      this.ns.corporation.levelUpgrade(this.lvlUps[0]);
      this.ns.corporation.levelUpgrade(this.lvlUps[1]);
    }
    for (let city of this.cities) {
      for (let i = 0; i < 2; i++) {
        this.ns.corporation.upgradeOfficeSize(this.agriName, city, 3); // this works
        while (this.ns.corporation.hireEmployee(this.agriName, city)) { }; // this works
        /*const jobAssign = [1, 1, 1, 1, 5]; //this or the below doesn't work
        for (let i = 0; i < 5; i++); { this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[i], jobAssign[i]); }
        */
      }
      this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[0], 1)
      this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[1], 1)
      this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[2], 1)
      this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[3], 1)
      this.ns.corporation.setAutoJobAssignment(this.agriName, city, this.jobs[4], 5)
    }

    for (let i = 0; i < 7; i++) {
      for (let city of this.cities) {
        this.ns.corporation.upgradeWarehouse(this.agriName, city, 4);
      }
    }
    this.stage[0] += 1;
    this.stage[1] = 0;
  }

  //Buy last upgrades for Agriculture
  lastAGUpgrades() {
    for (let i = 0; i < 9; i++) {
      for (let city of this.cities) {
        this.ns.corporation.upgradeWarehouse(this.agriName, city, 1);
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
    for (let i = 0; i < 9; i++) {
      this.ns.corporation.upgradeOfficeSize(this.tobaccoName, this.cities[0], 3);
    }
    while (this.ns.corporation.hireEmployee(this.tobaccoName, this.cities[0])) { }
    this.ns.corporation.setAutoJobAssignment(this.tobaccoName, this.cities[0], this.jobs[0], Math.floor(this.ns.corporation.getOffice(this.tobaccoName, this.cities[0]).numEmployees / 3.5));
    this.ns.corporation.setAutoJobAssignment(this.tobaccoName, this.cities[0], this.jobs[1], Math.floor(this.ns.corporation.getOffice(this.tobaccoName, this.cities[0]).numEmployees / 3.5));
    this.ns.corporation.setAutoJobAssignment(this.tobaccoName, this.cities[0], this.jobs[2], Math.floor(0.5 * this.ns.corporation.getOffice(this.tobaccoName, this.cities[0]).numEmployees / 3.5));
    this.ns.corporation.setAutoJobAssignment(this.tobaccoName, this.cities[0], this.jobs[3], Math.ceil(this.ns.corporation.getOffice(this.tobaccoName, this.cities[0]).numEmployees / 3.5));
    for (let city of this.cities) {
      if (city == this.cities[0]) continue;
      for (let i = 0; i < 2; i++) {
        if (!this.ns.corporation.getDivision(this.tobaccoName).cities.includes(city)) {
          this.ns.corporation.expandCity(this.tobaccoName, city);
        }
        if (!this.ns.corporation.hasWarehouse(this.tobaccoName, city)) { this.ns.corporation.purchaseWarehouse(this.tobaccoName, city); }
        this.ns.corporation.upgradeOfficeSize(this.tobaccoName, city, 3);
        while (this.ns.corporation.hireEmployee(this.tobaccoName, city)) { }
        /*const jobAssign = [1, 1, 1, 1, 5];
        for (let i = 0; i < 5; i++); { this.ns.corporation.setAutoJobAssignment(this.tobaccoName, city, this.jobs[i], jobAssign[i]); }
        */
      }
      this.ns.corporation.setAutoJobAssignment(this.tobaccoName, city, this.jobs[0], 1);
      this.ns.corporation.setAutoJobAssignment(this.tobaccoName, city, this.jobs[1], 1);
      this.ns.corporation.setAutoJobAssignment(this.tobaccoName, city, this.jobs[2], 1);
      this.ns.corporation.setAutoJobAssignment(this.tobaccoName, city, this.jobs[3], 1);
      this.ns.corporation.setAutoJobAssignment(this.tobaccoName, city, this.jobs[4], 5);
    }

    this.ns.corporation.makeProduct(this.tobaccoName, this.cities[0], "Tobacco v1", 1e9, 1e9);
    /*for (let i = 2; i < 6; i++) {
      this.ns.corporation.levelUpgrade("DreamSense");
    }*/ // don't need no stinkin DreamSense
    for (let i = 2; i < 6; i++) {
      while (this.ns.corporation.getUpgradeLevel(this.lvlUps[i]) < 20) {
        this.ns.corporation.levelUpgrade(this.lvlUps[i]);
      }
    }
    for (let i = 0; i < 10; i++) {
      this.ns.corporation.levelUpgrade("Project Insight");
    }

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
    while (ns.corporation.getCorporation().state != "START") {
      //when you make your main script, put things you want to be done
      //potentially multiple times every cycle, like buying upgrades, here.
      await ns.sleep(0);
    }

    while (ns.corporation.getCorporation().state == "START") {
      //same as above
      await ns.sleep(0);
    }
    //and to this part put things you want done exactly once per cycle
    bus.teaParty();
    bus.checkStage();
  }


}
