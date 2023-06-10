export class Business {
  /**@type {NS} */
  ns
  c
  corpName
  divNames
  divTypes
  investNum
  jobs
  boostStock
  lvlUps
  cities
  boostPhases
  stage
  mats
  divProd
  constructor(ns) {
    /**@type {NS} */
    this.ns = ns;
    this.c = ns.corporation;
    this.corpName = "TerraCorp";
    this.divNames = {
      agriName: "AgriCorp",
      tobaccoName: "CamelCorp",
      waterName: "AquaCorp",
      chemName: "ChemCorp",
      restName: "DelTacoCorp",
      restFraudNames: ["BurgerKingCorp", "SubWayCorp", "OliveGardenCorp", "JackInTheBoxCorp", "PopeyesCorp"]
    }
    this.divTypes = {
      agriType: "Agriculture",
      tobaccoType: "Tobacco",
      waterType: "Spring Water",
      chemType: "Chemical",
      restType: "Restaurant"
    }
    this.divProd = {
      tob: "Tobacco v",
      comp: "Asus v",
      soft: "Jarvis v",
      rob: "Chappy v",
      phar: "CureAll v",
      heal: "Kaiser #",
      real: "Apartments #",
      rest: {
        del: "DelTaco #",
        bk: "BurgerKing #",
        sw: "SubWay #",
        og: "OliveGarden #",
        jb: "JackInTheBox #",
        pe: "PopEyes #"
      }
    }
    this.investNum = 0;

    this.jobs = ["Operations", "Engineer", "Business", "Management", "Research & Development"];
    this.boostStock = ["Hardware", "Robots", "AI Cores", "Real Estate"];
    this.lvlUps = ["Smart Factories", "Smart Storage", "FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants", "Wilson Analytics", "Project Insight", "ABC SalesBots", "DreamSense"];
    this.unlocks = ["Smart Supply", "Exports"];
    this.cities = ["Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven", "Sector-12"];
    this.mats = ["Water", "Food", "Plants", "Chemicals", "Drugs", "Ore", "Metal"];

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

  //function to replicate smart supply and save money earlygame should we need it (agriculture)
  dumbSupply() {
    if (this.ns.corporation.hasUnlock("Smart Supply")) { return; }
    const divs = this.ns.corporation.getCorporation().divisions;
    for (const divName of divs) {
      const div = this.ns.corporation.getDivision(divName);
      const industry = this.ns.corporation.getIndustryData(div.type);
      for (const city of div.cities) {
        const office = this.ns.corporation.getOffice(divName, city);
        const opProd = office.employeeProductionByJob.Operations || 0;
        const engrProd = office.employeeProductionByJob.Engineer || 0;
        const mgmtProd = office.employeeProductionByJob.Management || 0;
        const totalProd = opProd + engrProd + mgmtProd;
        if (totalProd === 0) continue;
        const mgmtFactor = 1 + mgmtProd / (1.2 * totalProd);
        const prod = (Math.pow(opProd, 0.4) + Math.pow(engrProd, 0.3)) * mgmtFactor * 0.05;
        const tProd =
          prod *
          div.productionMult *
          (1 + this.ns.corporation.getUpgradeLevel("Smart Factories") * 3 / 100)
          // * research multipliers, once I figure out how to access them.
          ;
        const required = industry.requiredMaterials;
        for (const [mat, amount] of Object.entries(required)) {
          const stored = this.ns.corporation.getMaterial(divName, city, mat).stored / 10;
          const needed = Math.max(amount * tProd - stored, 0);
          this.ns.corporation.buyMaterial(divName, city, mat, needed);
        }
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
        if (this.stage[1] == 0) this.ns.print("Imbezzlement initiating");
        this.restaurantFraud(1); //stage 2
        break;
      case 3:
        if (this.stage[1] == 0) this.ns.print("Accepting the first investor offer.");
        this.invest(); //stage 3 //1st investor offer is around 15 trillion
        break;
      case 4:
        if (this.stage[1] == 0) this.ns.print("Now to do it again but times 6");
        this.enronFraudPrep(); //stage 4 // this is where we're still building
        break;
      case 5:
        if (this.stage[1] == 0) this.ns.print("Waiting for the employers stats to rise for the second time");
        this.employeeSatisfactionCheck(); //stage 5
        break;
      case 6:
        if (this.stage[1] == 0) this.ns.print("Buying false securities material batch");
        this.restaurantFraud(2); //stage 6
        break;
      case 7:
        if (this.stage[1] == 0) this.ns.print("Accepting the second investor offer");
        this.invest(this.ns.corporation.getInvestmentOffer().round); //stage 7
        break;
      case 8:
        if (this.stage[1] == 0) this.ns.print("Time to actually make a real company");
        this.expand(); //stage 8
        break;
      case 9:
        this.ns.print("Assigning Employees and Starting a product");
        this.reAssignEmployees(); //stage 9
        break;
      case 10:
        if (this.stage[1] == 0) this.ns.print("Good for Now, spawning buyCorpStuff");
        //this.purchaseMaterials(2); //stage 10
        this.ns.spawn("buycorpstuff.js");
        break;
      case 11:
        if (this.stage[1] == 0) this.ns.print("Expand to tobacco");
        this.expandToTobacco(); //stage 11
        break;
      case 12:
        //enter the main corp script below or remove/comment out ns.spawn if you don't have one
        this.ns.print("this is the part of the script that normally spawns the mid-endgame script. nothing happens right now.");
        this.ns.spawn("buycorpstuff.js");
        break;
    }
  }

  //Corp initialization. Creating the corp, expanding to restaurant and its' cities,
  //hiring and assigning in those cities and buying some upgrades
  startstuff() {
    if (this.stage[1] == 0) {
      if (!this.ns.corporation.hasCorporation()) { try { this.ns.corporation.createCorporation(this.corpName, false); } catch { this.ns.print("not in bitnode 3, attempting to self-fund"); } }
      if (!this.ns.corporation.hasCorporation()) { try { this.ns.corporation.createCorporation(this.corpName); } catch { this.ns.print("self funding failed, requires 150 billion in cash available."); this.ns.exit(); } }
      this.stage[1] = 1;
    }
    if (this.stage[1] == 1) {
      if (!this.ns.corporation.getCorporation().divisions.includes(this.divNames.restName)) { this.ns.corporation.expandIndustry(this.divTypes.restType, this.divNames.restName); }
      this.stage[1] = 2;
    }
    if (this.stage[1] == 2) {
      for (let city of this.cities) {
        if (!this.ns.corporation.getDivision(this.divNames.restName).cities.includes(city)) { this.ns.corporation.expandCity(this.divNames.restName, city); }
        if (!this.ns.corporation.hasWarehouse(this.divNames.restName, city)) { this.ns.corporation.purchaseWarehouse(this.divNames.restName, city); }
        this.ns.corporation.upgradeOfficeSize(this.divNames.restName, city, 3);
        while (this.ns.corporation.hireEmployee(this.divNames.restName, city)) { } //hires employee and returns true. empty brackets simply makes it test the statement immediately again.
        this.ns.corporation.setAutoJobAssignment(this.divNames.restName, city, this.jobs[2], 6);
      }
      for (let i = 0; i < 24; i++) { this.ns.corporation.hireAdVert(this.divNames.restName); }

      for (let i = 0; i < 3; i++) { this.ns.corporation.levelUpgrade(this.lvlUps[8]); }
      for (let city of this.cities) { this.ns.corporation.upgradeWarehouse(this.divNames.restName, city, 2); }

      this.stage[0] += 1;
      this.stage[1] = 0;
    }
  }

  //expand to Agriculture, Tobacco, and Chemicals
  expand() {
    if (this.stage[1] == 0) {
      this.ns.corporation.purchaseUnlock("Smart Supply");
      this.ns.corporation.expandIndustry(this.divTypes.agriType, this.divNames.agriName);
      this.ns.corporation.expandIndustry(this.divTypes.chemType, this.divNames.chemName);
      this.ns.corporation.expandIndustry(this.divTypes.tobaccoType, this.divNames.tobaccoName);
      const newDivs = [this.divNames.agriName, this.divNames.chemName, this.divNames.tobaccoName];
      for (const division of newDivs) {
        for (let city of this.cities) {
          if (!this.ns.corporation.getDivision(division).cities.includes(city)) { this.ns.corporation.expandCity(division, city); }
          if (!this.ns.corporation.hasWarehouse(division, city)) { this.ns.corporation.purchaseWarehouse(division, city); }
          this.ns.corporation.setSmartSupply(division, city, true);
          this.ns.corporation.upgradeOfficeSize(division, city, 30 - this.ns.corporation.getOffice(division, city).size);
          while (this.ns.corporation.hireEmployee(division, city)) { }
          this.ns.corporation.upgradeWarehouse(division, city, (20 - this.ns.corporation.getWarehouse(city, division).level))
        }
      }
      for (let i = 0; i < 50; i++) {
        this.ns.corporation.hireAdVert(this.divName.tobaccoName)
      }
      this.ns.corporation.upgradeOfficeSize(this.divName.tobaccoName, this.cities[0], 30);
      while (this.ns.corporation.hireEmployee(this.divName.tobaccoName, this.cities[0])) { }
    }
    this.stage[0] += 1;
  }

  //Wait till the employee stats are high enough and then go to the next stage
  employeeSatisfactionCheck() {
    this.ns.clearLog();
    const overallAvgs = [];
    let finalMorAvg = 0;
    let finalEneAvg = 0;
    for (const division of this.ns.corporation.getCorporation().divisions) {
      const avgs = [0, 0];
      this.ns.print("   " + division);
      this.ns.print("");
      for (const city of this.ns.corporation.getDivision(division).cities) {
        avgs[0] += this.ns.corporation.getOffice(division, city).avgMorale;
        avgs[1] += this.ns.corporation.getOffice(division, city).avgEnergy;
      }
      this.ns.print("   avg morale: " + (avgs[0] / 6).toFixed(3) + "/95");
      this.ns.print("   avg energy: " + (avgs[1] / 6).toFixed(3) + "/95");
      overallAvgs.push(avgs);
      this.stage[1]++;
    }
    for (let i = 0; i < overallAvgs.length; i++) {
      finalMorAvg += overallAvgs[i][0];
      finalEneAvg += overallAvgs[i][1];
    }
    finalMorAvg = finalMorAvg / (this.ns.corporation.getCorporation().divisions.length * this.cities.length);
    finalEneAvg = finalEneAvg / (this.ns.corporation.getCorporation().divisions.length * this.cities.length);
    if (finalMorAvg >= 95 && finalEneAvg >= 95 && this.stage[1] > 0) {
      this.stage[0] += 1; this.stage[1] = 0;
    }
  }

  //Fill Warehouses with Real Estate to sell
  restaurantFraud(phase) {
    if (phase == 1) {
      if (this.stage[1] == 0) {
        for (const city of this.ns.corporation.getDivision(this.divNames.restName).cities) {
          const rlEstConst = this.ns.corporation.getMaterialData(this.boostStock[3]);
          const warehouse = this.ns.corporation.getWarehouse(this.divNames.restName, city);
          this.ns.corporation.buyMaterial(this.divNames.restName, city, this.boostStock[3], (((warehouse.size - warehouse.sizeUsed) / rlEstConst.size) / 10));
        }
        this.stage[1] = 1;
      } else if (this.stage[1] == 1) {
        if (this.ns.corporation.getWarehouse(this.divNames.restName, this.cities[0]).sizeUsed >= this.ns.corporation.getWarehouse(this.divNames.restName, this.cities[0]).size * 0.95) {
          for (const city of this.ns.corporation.getDivision(this.divNames.restName).cities) {
            this.ns.corporation.buyMaterial(this.divNames.restName, city, this.boostStock[3], 0);
          }
          this.stage[1] = 2;
        }
      } else if (this.stage[1] == 2) {
        for (const city of this.ns.corporation.getDivision(this.divNames.restName).cities) {
          this.ns.corporation.sellMaterial(this.divNames.restName, city, this.boostStock[3], "MAX", "MP");
        }
        this.stage[0] += 1;
        this.stage[1] = 0;
      }

    }
    if (phase == 2) {
      if (this.stage[1] == 0) {
        for (const division of this.ns.corporation.getCorporation().divisions) {
          for (const city of this.ns.corporation.getDivision(division).cities) {
            const rlEstConst = this.ns.corporation.getMaterialData(this.boostStock[3]);
            const warehouse = this.ns.corporation.getWarehouse(division, city);
            this.ns.corporation.buyMaterial(division, city, this.boostStock[3], (((warehouse.size - warehouse.sizeUsed) / rlEstConst.size) / 10));
          }
        }
        this.stage[1] = 1;
      } else if (this.stage[1] == 1) {
        if (ns.corporation.getWarehouse(this.divNames.restName, this.cities[0]).sizeUsed >= this.ns.corporation.getWarehouse(this.divNames.restName, this.cities[0]).size * 0.95) {
          for (const division of this.ns.corporation.getCorporation().divisions) {
            for (const city of this.ns.corporation.getDivision(division).cities) {
              this.ns.corporation.buyMaterial(division, city, this.boostStock[3], 0);
            }
          }
          this.stage[1] = 2;
        }
      } else if (this.stage[1] == 2) {
        for (const division of this.ns.corporation.getCorporation().divisions) {
          for (const city of this.ns.corporation.getDivision(division).cities) {
           this.nscorporation.sellMaterial(division, city, this.boostStock[3], "MAX", "MP");
          }
        }
        this.stage[0] += 1;
        this.stage[1] = 0;
      }
    }
  }

  //Assigning employees everywhere (and making a product at tobacco)
  reAssignEmployees() {
    const divs = [this.divNames.agriName, this.divNames.chemName, this.divNames.tobaccoName];
    const rests = [this.divNames.restName, this.divNames.restFraudNames[0], this.divNames.restFraudNames[1], this.divNames.restFraudNames[2], this.divNames.restFraudNames[3], this.divNames.restFraudNames[4]];
    for (const division of this.ns.corporation.getCorporation().divisions) {
      for (const city of this.cities) {
        for (const job of this.jobs) { //set all jobs to none everywhere
          this.ns.corporation.setAutoJobAssignment(division, prodCity, job, 0);
        }
      }
    }
    for (const rest of rests) {
      for (const city of this.cities) { //set all these fools to research and development.
        this.ns.corporation.setAutoJobAssignment(rest, city, job[4], this.ns.corporation.getOffice(division, city).numEmployees);
      } //we won't be restauranting for a bit.
    }

    //this.jobs = ["Operations", "Engineer", "Business", "Management", "Research & Development"];
    for (let i = 0; i < 2; i++) { //this will work for agriculture and chemicals.
      for (const city of this.cities) {
        this.ns.corporation.setAutoJobAssignment(divs[i], city, this.jobs[4], 6);
        this.ns.corporation.setAutoJobAssignment(divs[i], city, this.jobs[0], 6);
        this.ns.corporation.setAutoJobAssignment(divs[i], city, this.jobs[1], 9);
        this.ns.corporation.setAutoJobAssignment(divs[i], city, this.jobs[2], 3);
        this.ns.corporation.setAutoJobAssignment(divs[i], city, this.jobs[3], 6);
      }
    }
    //now tobacco
    this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[0], this.jobs[4], 0); //this formula scales, and is for product city
    this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[0], this.jobs[0], Math.floor(this.ns.corporation.getOffice(division, prodCity).numEmployees / 3.5));
    this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[0], this.jobs[1], Math.floor(this.ns.corporation.getOffice(division, prodCity).numEmployees / 3.5));
    this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[0], this.jobs[2], Math.floor(0.5 * this.ns.corporation.getOffice(division, prodCity).numEmployees / 3.5));
    this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[0], this.jobs[3], Math.ceil(this.ns.corporation.getOffice(division, prodCity).numEmployees / 3.5));

    for (let i = 1; i < 6; i++) { //support cities
      this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[i], jobs[5], 0);
      this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[i], jobs[0], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 20), 1));
      this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[i], jobs[1], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 20), 1));
      this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[i], jobs[2], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 20), 1));
      this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[i], jobs[3], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 20), 1));
      //this little gem of a logic will assign all remaining employees to the remaining job incrementally
      let rdNum = 0; //in a try/catch bracket because it tries to break the script otherwise.
      try { while (this.ns.corporation.setAutoJobAssignment(division, city, jobs[4], rdNum++)) { } } catch { };
    }
    //finally, lets start a product.
    const funds = this.ns.corporation.getCorporation().funds * 0.01
    this.ns.corporation.makeProduct(this.divNames.tobaccoName, this.cities[0], this.divProd.tob, funds, funds);

    this.stage[0]++;
    this.stage[1] = 0;
  }

  //Accept investor offers after 10 cycles
  invest(round) {
    if (this.stage[1] == 0) {
      this.ns.print("waiting for a bit, just in case the investors might give a bit more money");
    }
    //investor evaluation takes into account 10 cycles
    //and we want them to take into account the current high earning cycles,
    //not the old low earning cycles, so we'll wait for a bit
    if (this.stage[1] <= 30 && this.investNum < this.ns.corporation.getInvestmentOffer().funds) {
      this.ns.print("waiting cycles: " + this.stage[1] + "/30. investors are currently offering: " + this.ns.formatNumber(this.ns.corporation.getInvestmentOffer().funds, 3));
      this.stage[1] += 1;
      this.investNum = this.ns.corporation.getInvestmentOffer().funds;
      // if (this.investNum > this.ns.corporation.getInvestmentOffer().funds) { this.ns.print("accepting offer before it downturns anymore"); this.ns.corporation.acceptInvestmentOffer(); }
    }
    else if (this.ns.corporation.getCorporation().state != "PURCHASE") {this.nssleep(0); }
    else {
      this.ns.tprint("investment offer round " + round + ": " + this.ns.formatNumber(this.ns.corporation.getInvestmentOffer().funds, 3));
      this.ns.corporation.acceptInvestmentOffer();
      this.stage[0] += 1;
      this.stage[1] = 0;
    }
  }

  //this is where we go ham and expand to 6 restaurants and do securities fraud on all 6 of them.
  enronFraudPrep() {
    const fraudNames = [];
    fraudNames.push(this.divNames.restName);
    for (const name of this.divNames.fraudNames) {
      fraudNames.push(name);
    }
    for (const div of fraudNames) {
      if (div == this.divNames.restName) { continue; }
      this.ns.corporation.expandIndustry(this.divTypes.restType, div);
      for (let city of this.cities) {
        if (!this.ns.corporation.getDivision(div).cities.includes(city)) {this.nscorporation.expandCity(div, city); }
        if (!this.ns.corporation.hasWarehouse(div, city)) { this.ns.corporation.purchaseWarehouse(div, city) }
        this.ns.corporation.upgradeOfficeSize(div, city, 3);
        while (this.ns.corporation.hireEmployee(div, city)) { }
        this.ns.corporation.setAutoJobAssignment(div, city, this.jobs[2])
        this.ns.corporation.upgradeWarehouse(div, city, 2);
      }
      for (let i = 0; i < 24; i++) { this.ns.corporation.hireAdVert(div) }
      //the goal here is to set the new rest divs exactly to the old one, and then upgrade them all equally together.
    }
    //all new upgrades done to all 6 divs start here.
    //this.lvlUps = ["Smart Factories", "Smart Storage", "FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants", "Wilson Analytics", "Project Insight", "ABC SalesBots"];
    for (let i = 0; i < 10; i++) {
      this.ns.corporation.levelUpgrade(this.lvlUps[1]); //most upgrades to level 10
      this.ns.corporation.levelUpgrade(this.lvlUps[2]);
      this.ns.corporation.levelUpgrade(this.lvlUps[3]);
      this.ns.corporation.levelUpgrade(this.lvlUps[4]);
      this.ns.corporation.levelUpgrade(this.lvlUps[5]);
      this.ns.corporation.levelUpgrade(this.lvlUps[6]); //especially wilson's
      this.ns.corporation.levelUpgrade(this.lvlUps[9]);
    }
    for (let i = 0; i < 47; i++) {
      this.ns.corporation.levelUpgrade(this.lvlUps[8]); //ABC salesbots level 50
    }
    for (const division of this.ns.corporation.getCorporation().divisions) {
      for (let i = 0; i < (54 - this.nscorporation.getHireAdVertCount(division)); i++) { this.ns.corporation.hireAdVert(division); } //play with the number. set to 30 arbitrarily.
      for (const city of this.cities) {
        this.ns.corporation.upgradeOfficeSize(division, city, (30 - this.ns.corporation.getOffice(division, city).size));
        while (ns.corporation.hireEmployee(division, city, "Business")) { }
        this.ns.corporation.upgradeWarehouse(division, city, (10 - this.ns.corporation.getWarehouse(division, city).level));
      }
    }

    this.stage[0] += 1;
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
    try { this.ns.corporation.expandIndustry("Tobacco", this.tobaccoName); } catch { this.ns.tprint("Couldn't expand.. no money"); this.ns.exit(); }
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
    bus.dumbSupply();
  }


}
