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
    };
    this.divTypes = {
      agriType: "Agriculture",
      tobaccoType: "Tobacco",
      waterType: "Spring Water",
      chemType: "Chemical",
      restType: "Restaurant"
    };
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
        pe: "PopEyes #",
      }
    };
    this.investNum = 0;

    this.jobs = ["Operations", "Engineer", "Business", "Management", "Research & Development", "Intern"];
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
    ];
    this.stage = [0, 0]; //stage, step
  }

  //Tea and Party function
  teaParty() {
    for (const division of this.ns.corporation.getCorporation().divisions) {
      if (this.ns.corporation.hasResearched(division, "AutoBrew") && this.ns.corporation.hasResearched(division, "AutoPartyManager")) { continue; }
      for (const city of this.ns.corporation.getDivision(division).cities) {
        const office = this.ns.corporation.getOffice(division, city);
        if (office.avgEnergy < 98) { this.ns.corporation.buyTea(division, city); }
        if (office.avgMorale < 98) { this.ns.corporation.throwParty(division, city, 500_000); }
      }
    }
  }

  //function to replicate smart supply and save money earlygame should we need it (agriculture)
  dumbSupply() { //this is largely unneeded, but would only be used in this script, so it will
    //remain here in expectation for changes to happen again and this needing to be solved again.
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
    if (this.ns.corporation.hasCorporation()) {
      if (this.ns.corporation.getCorporation().divisions.includes(this.divNames.tobaccoName)) {
        if (this.ns.corporation.getInvestmentOffer().round >= 3 && this.ns.corporation.getDivision(this.divNames.tobaccoName).products.length >= 1 && this.ns.corporation.getCorporation().divisions.includes(this.divNames.chemName)) {
          this.stage[0] = 10; //just checks to see if we've made it to the last step of the checkStage() so we can go straight to-the-moon again.
        }
      }
    }
  }

  //Check which action should be done at this point and do it
  //Importantly none of these functions wait for a number of cycles on their own, rather they count cycles while letting the loop to work every cycle.
  /** @param {NS} ns */
  checkStage() {
    this.setStage();
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
        this.invest(this.ns.corporation.getInvestmentOffer().round); //stage 7 //2nd investor offer is around 4 quadrillion
        break;
      case 8:
        if (this.stage[1] == 0) this.ns.print("Time to actually make a real company");
        this.expand(); //stage 8
        break;
      case 9:
        if (this.stage[1] == 0) this.ns.print("Assigning Employees and Starting a product");
        this.reAssignEmployees(); //stage 9
        break;
      case 10:
        if (this.stage[1] == 0) this.ns.print("Purchasing Boost Materials");
        this.stage[0]++;
        this.boostPurchase(); //stage 10
        break;
      case 11:
        if (this.stage[1] == 0) this.ns.print("The initial setup is complete. executing 'To the moon...' logic");
        this.stage[1]++;
        //stage 10
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
      for (let i = 0; i < 26; i++) { this.ns.corporation.hireAdVert(this.divNames.restName); }

      for (let i = 0; i < 2; i++) { this.ns.corporation.levelUpgrade(this.lvlUps[8]); }
      for (let city of this.cities) { this.ns.corporation.upgradeWarehouse(this.divNames.restName, city, 1); }

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
          this.ns.corporation.upgradeWarehouse(division, city, (20 - this.ns.corporation.getWarehouse(division, city).level))
        }
      }
      for (let i = 0; i < 100; i++) {
        this.ns.corporation.hireAdVert(this.divNames.tobaccoName)
      }
      this.ns.corporation.upgradeOfficeSize(this.divNames.tobaccoName, this.cities[0], 30);
      while (this.ns.corporation.hireEmployee(this.divNames.tobaccoName, this.cities[0])) { }
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
        if (this.ns.corporation.getWarehouse(this.divNames.restName, this.cities[0]).sizeUsed >= this.ns.corporation.getWarehouse(this.divNames.restName, this.cities[0]).size * 0.95) {
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
            this.ns.corporation.sellMaterial(division, city, this.boostStock[3], "MAX", "MP");
          }
        } //we will be left with negative 1.7 trillion.
        this.stage[0] += 1;
        this.stage[1] = 0;
      }
    }
  }

  //Assigning employees everywhere (and making a product at tobacco)
  reAssignEmployees() {
    for (let i = 0; i < 50; i++) {
      this.ns.corporation.levelUpgrade(this.lvlUps[7])
    }
    const divs = [this.divNames.agriName, this.divNames.chemName, this.divNames.tobaccoName];
    const rests = [this.divNames.restName, this.divNames.restFraudNames[0], this.divNames.restFraudNames[1], this.divNames.restFraudNames[2], this.divNames.restFraudNames[3], this.divNames.restFraudNames[4]];
    for (const division of this.ns.corporation.getCorporation().divisions) {
      for (const city of this.cities) {
        for (const job of this.jobs) { //set all jobs to none everywhere
          this.ns.corporation.setAutoJobAssignment(division, city, job, 0);
        }
      }
    }
    for (const rest of rests) {
      for (const city of this.cities) { //set all these fools to research and development.
        this.ns.corporation.setAutoJobAssignment(rest, city, this.jobs[4], this.ns.corporation.getOffice(rest, city).numEmployees);
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
    this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[0], this.jobs[0], Math.floor(this.ns.corporation.getOffice(divs[2], this.cities[0]).numEmployees / 3.5));
    this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[0], this.jobs[1], Math.floor(this.ns.corporation.getOffice(divs[2], this.cities[0]).numEmployees / 3.5));
    this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[0], this.jobs[2], Math.floor(0.5 * this.ns.corporation.getOffice(divs[2], this.cities[0]).numEmployees / 3.5));
    this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[0], this.jobs[3], Math.ceil(this.ns.corporation.getOffice(divs[2], this.cities[0]).numEmployees / 3.5));

    for (let i = 1; i < 6; i++) { //support cities
      this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[i], this.jobs[4], 0);
      this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[i], this.jobs[0], Math.max(Math.floor(this.ns.corporation.getOffice(divs[2], this.cities[i]).numEmployees / 20), 1));
      this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[i], this.jobs[1], Math.max(Math.floor(this.ns.corporation.getOffice(divs[2], this.cities[i]).numEmployees / 20), 1));
      this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[i], this.jobs[2], Math.max(Math.floor(this.ns.corporation.getOffice(divs[2], this.cities[i]).numEmployees / 20), 1));
      this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[i], this.jobs[3], Math.max(Math.floor(this.ns.corporation.getOffice(divs[2], this.cities[i]).numEmployees / 20), 1));
      //this little gem of a logic will assign all remaining employees to the remaining job incrementally
      let rdNum = 0; //in a try/catch bracket because it tries to break the script otherwise.
      try { while (this.ns.corporation.setAutoJobAssignment(divs[2], this.cities[i], this.jobs[4], rdNum++)) { } } catch { };
    }
    //finally, lets start a product.
    const funds = this.ns.corporation.getCorporation().funds * 0.01
    this.ns.corporation.makeProduct(this.divNames.tobaccoName, this.cities[0], this.divProd.tob + 1, funds, funds);

    this.stage[0]++;
    this.stage[1] = 0;
  }

  //Accept investor offers after 10 cycles
  invest() {
    if (this.stage[1] == 0) {
      this.ns.print("waiting for a bit, just in case the investors might give a bit more money");
    }
    //investor evaluation takes into account 10 cycles
    //and we want them to take into account the current high earning cycles,
    //not the old low earning cycles, so we'll wait for a bit
    if (this.stage[1] <= 10 && this.investNum < this.ns.corporation.getInvestmentOffer().funds) {
      this.ns.print("waiting cycles: " + this.stage[1] + "/10. investors are currently offering: " + this.ns.formatNumber(this.ns.corporation.getInvestmentOffer().funds, 3));
      this.stage[1] += 1;
      this.investNum = this.ns.corporation.getInvestmentOffer().funds;
      // if (this.investNum > this.ns.corporation.getInvestmentOffer().funds) { this.ns.print("accepting offer before it downturns anymore"); this.ns.corporation.acceptInvestmentOffer(); }
    }
    else if (this.ns.corporation.getCorporation().state != "PURCHASE") { this.ns.sleep(0); }
    else {
      this.ns.tprint("funds remaining before accepting investment round: " + this.ns.formatNumber(this.ns.corporation.getCorporation().funds, 3));
      this.ns.tprint("investment offer round " + this.ns.corporation.getInvestmentOffer().round + ": " + this.ns.formatNumber(this.ns.corporation.getInvestmentOffer().funds, 3));
      this.ns.corporation.acceptInvestmentOffer();
      this.stage[0] += 1;
      this.stage[1] = 0;
    }
  }

  //this is where we go ham and expand to 6 restaurants and do securities fraud on all 6 of them.
  enronFraudPrep() {
    const fraudNames = [];
    fraudNames.push(this.divNames.restName);
    for (const name of this.divNames.restFraudNames) {
      fraudNames.push(name);
    }
    for (const div of fraudNames) {
      if (div == this.divNames.restName) { continue; }
      this.ns.corporation.expandIndustry(this.divTypes.restType, div);
      for (let city of this.cities) {
        if (!this.ns.corporation.getDivision(div).cities.includes(city)) { this.ns.corporation.expandCity(div, city); }
        if (!this.ns.corporation.hasWarehouse(div, city)) { this.ns.corporation.purchaseWarehouse(div, city) }
        this.ns.corporation.upgradeOfficeSize(div, city, 3);
        while (this.ns.corporation.hireEmployee(div, city, this.jobs[2])) { }
        this.ns.corporation.upgradeWarehouse(div, city, 2);
      }
      for (let i = 0; i < 24; i++) { this.ns.corporation.hireAdVert(div) }
      //the goal here is to set the new rest divs exactly to the old one, and then upgrade them all equally together.
    }
    //all new upgrades done to all 6 divs start here.
    //this.lvlUps = ["Smart Factories", "Smart Storage", "FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants", "Wilson Analytics", "Project Insight", "ABC SalesBots"];
    for (let i = 0; i < 40; i++) {
      this.ns.corporation.levelUpgrade(this.lvlUps[1]); //most upgrades to level 20
      this.ns.corporation.levelUpgrade(this.lvlUps[2]);
      this.ns.corporation.levelUpgrade(this.lvlUps[3]);
      this.ns.corporation.levelUpgrade(this.lvlUps[4]);
      this.ns.corporation.levelUpgrade(this.lvlUps[5]);
      this.ns.corporation.levelUpgrade(this.lvlUps[9]);
    }
    for (let i = 0; i < 10; i++) {
      this.ns.corporation.levelUpgrade(this.lvlUps[6]); //wilson's level 10
    }
    for (let i = 0; i < 68; i++) {
      this.ns.corporation.levelUpgrade(this.lvlUps[8]); //ABC salesbots level 50
    }
    for (const division of this.ns.corporation.getCorporation().divisions) {
      for (let i = 0; i < (80 - this.ns.corporation.getHireAdVertCount(division)); i++) { this.ns.corporation.hireAdVert(division); } //play with the number. set to 30 arbitrarily.
      for (const city of this.cities) {
        this.ns.corporation.upgradeOfficeSize(division, city, (45 - this.ns.corporation.getOffice(division, city).size));
        while (this.ns.corporation.hireEmployee(division, city, "Business")) { }
        this.ns.corporation.upgradeWarehouse(division, city, (10 - this.ns.corporation.getWarehouse(division, city).level));
      }
    } //these numbers leave us with 1.1 trillion left to purchase materials with.

    this.stage[0] += 1;
  }

  //all functions to be done to the moon go here onward.

  //purchases all division upgrades.
  async divisPurchases() {
    const prodCity = this.cities[0]; //if you write functions outside of classes then bring them in, bandaid solutions are easiest.
    const supportCities = [this.cities[1], this.cities[2], this.cities[3], this.cities[4], this.cities[5]];
    const divisions = this.ns.corporation.getCorporation().divisions
    let funds = this.ns.corporation.getCorporation().funds * 0.2;
    //we want to concentrate on a single product producing division. Tobacco is the current winner.
    let tobaccoFunds = this.ns.corporation.getCorporation().funds * 0.8;
    for (const division of divisions) {
      if (this.divNames.restFraudNames.includes(division)) { continue; }
      if (this.divNames.restName.includes(division) && this.ns.corporation.getCorporation().funds < 1e21) { continue; }
      if (this.ns.corporation.getDivision(division).makesProducts) {
        let advertCost = this.ns.corporation.getHireAdVertCost(division);
        let officeExpCost = this.ns.corporation.getOfficeSizeUpgradeCost(division, prodCity, 3);
        let supportExps = [];
        let supportWHs = [];
        for (const city of supportCities) {
          supportExps.push(this.ns.corporation.getOfficeSizeUpgradeCost(division, city, 3));
          supportWHs.push(this.ns.corporation.getUpgradeWarehouseCost(division, city));
        }
        let supportExpCost = 0;
        let supportWHCost = 0;
        for (let i = 0; i < supportExps.length; i++) {
          supportExpCost += supportExps[i];
          supportWHCost += supportWHs[i];
        }
        let y = Math.max(this.ns.corporation.getOffice(division, prodCity).size, this.ns.corporation.getOffice(division, supportCities[0]).size, this.ns.corporation.getOffice(division, supportCities[1]).size, this.ns.corporation.getOffice(division, supportCities[2]).size, this.ns.corporation.getOffice(division, supportCities[3]).size, this.ns.corporation.getOffice(division, supportCities[4]).size);
        if (!supportExps.every((number) => number === supportExps[0])) {
          this.ns.print("found inbalance in supportExps for " + division + ". Correcting. goal is " + y);
          while (!supportExps.every((number) => number === supportExps[0])) {
            if (funds < supportExpCost) { this.ns.print("not enough funds to correct. awaiting funds"); return; }
            for (city of supportCities) {
              while (this.ns.corporation.getOffice(division, city).numEmployees < y) {
                this.ns.corporation.upgradeOfficeSize(division, city, 3);
                while (this.ns.corporation.hireEmployee(division, city)) { await this.ns.sleep(0); }
                funds = this.ns.corporation.getCorporation().funds * 0.5;
                await this.ns.sleep(0);
              }
            }
            y = Math.max(this.ns.corporation.getOffice(division, prodCity).size, this.ns.corporation.getOffice(division, supportCities[0]).size, this.ns.corporation.getOffice(division, supportCities[1]).size, this.ns.corporation.getOffice(division, supportCities[2]).size, this.ns.corporation.getOffice(division, supportCities[3]).size, this.ns.corporation.getOffice(division, supportCities[4]).size);
            supportExps = [];
            for (const city of supportCities) {
              supportExps.push(this.ns.corporation.getOfficeSizeUpgradeCost(division, city, 3));
            }
            await this.ns.sleep(0);
          }
        }
        while (this.ns.corporation.getOffice(division, prodCity).size < this.ns.corporation.getOffice(division, supportCities[0]).size + 30) {
          this.ns.print(prodCity + " is not 30 employees ahead of the other cities. correcting. goal is " + (this.ns.corporation.getOffice(division, supportCities[0]) + 30));
          this.ns.corporation.upgradeOfficeSize(division, prodCity, 3);
          while (this.ns.corporation.hireEmployee(division, prodCity)) { await this.ns.sleep(0); }
          funds = this.ns.corporation.getCorporation().funds * 0.5;
          await this.ns.sleep(0);
        }
        let z = Math.max(this.ns.corporation.getWarehouse(division, prodCity).level, this.ns.corporation.getWarehouse(division, supportCities[0]).level, this.ns.corporation.getWarehouse(division, supportCities[1]).level, this.ns.corporation.getWarehouse(division, supportCities[2]).level, this.ns.corporation.getWarehouse(division, supportCities[3]).level, this.ns.corporation.getWarehouse(division, supportCities[4]).level);
        while (!supportWHs.every((number) => number === supportWHs[0])) {
          this.ns.print("found inbalance in supportWHs. correcting. goal is " + z);
          this.ns.print("supportWHs: " + supportWHs);
          if (funds < supportWHCost) { return; }
          for (const city of supportCities) {
            while (this.ns.corporation.getWarehouse(division, city).level < z) {
              this.ns.corporation.upgradeWarehouse(division, city);
              this.ns.print("upgrading " + city + " warehouse in " + division);
              funds = this.ns.corporation.getCorporation().funds * 0.5;
              await this.ns.sleep(0);
            }
          }
          if (this.ns.corporation.getWarehouse(division, prodCity).level < z) { this.ns.corporation.upgradeWarehouse(division, prodCity); }
          funds = this.ns.corporation.getCorporation().funds * 0.75;
          supportWHs = [];
          for (const city of supportCities) {
            supportWHs.push(this.ns.corporation.getUpgradeWarehouseCost(division, city));
          }
          supportWHCost = 0;
          for (let i = 0; i < supportWHs.length; i++) {
            supportWHCost += supportWHs[i];
          }
          await this.ns.sleep(0);
        }
        if (this.ns.corporation.getOffice(division, supportCities[0]).size < 30) {
          for (const city of supportCities) {
            this.ns.corporation.upgradeOfficeSize(division, city, (30 - this.ns.corporation.getOffice(division, city).size));
            while (this.ns.corporation.hireEmployee(division, city)) { }
          }
        }
        if ((division == "CamelCorp")) {
          if (tobaccoFunds >= advertCost || tobaccoFunds >= officeExpCost) {
            if (officeExpCost > advertCost) { this.ns.corporation.hireAdVert(division); this.ns.print("AdVert bought in " + division); }
            if (officeExpCost < advertCost) {
              if (officeExpCost < supportExpCost) {
                this.ns.corporation.upgradeOfficeSize(division, prodCity, 3);
                while (this.ns.corporation.hireEmployee(division, prodCity)) { await this.ns.sleep(0); }
                this.ns.print("upgraded " + prodCity + " Office capacity in " + division + " (prodCity)");
                funds = this.ns.corporation.getCorporation().funds * 0.5;
              }
              else {
                for (const city of supportCities) {
                  this.ns.corporation.upgradeOfficeSize(division, city, 3);
                  while (this.ns.corporation.hireEmployee(division, city)) { }
                  this.ns.print("upgraded " + city + " office capacity in " + division);
                  funds = this.ns.corporation.getCorporation().funds * 0.5;
                }
              }
            }
            await this.ns.sleep(0);
          }
        }
        if ((funds * 0.8) / divisions.length >= advertCost || (funds * 0.8) / divisions.length >= officeExpCost) {
          if (officeExpCost > advertCost) { this.ns.corporation.hireAdVert(division); this.ns.print("AdVert bought in " + division); }
          if (officeExpCost < advertCost) {
            if (officeExpCost < supportExpCost) {
              this.ns.corporation.upgradeOfficeSize(division, prodCity, 3);
              while (this.ns.corporation.hireEmployee(division, prodCity)) { await this.ns.sleep(0); }
              this.ns.print("upgraded " + prodCity + " Office capacity in " + division + " (prodCity)");
              funds = this.ns.corporation.getCorporation().funds * 0.5;
            }
            else {
              for (const city of supportCities) {
                this.ns.corporation.upgradeOfficeSize(division, city, 3);
                while (this.ns.corporation.hireEmployee(division, city)) { }
                this.ns.print("upgraded " + city + " office capacity in " + division);
                funds = this.ns.corporation.getCorporation().funds * 0.5;
              }
            }
          }
          await this.ns.sleep(0);
        }
        while ((funds * 0.01) / divisions.length >= this.ns.corporation.getUpgradeWarehouseCost(division, supportCities[0]) * 6) {
          this.ns.print("upgrading warehouses in " + division);
          this.ns.corporation.upgradeWarehouse(division, prodCity);
          for (const city of supportCities) {
            this.ns.corporation.upgradeWarehouse(division, city);
          }
          await this.ns.sleep(0);
        }
      }
      else {
        let officeExps = [];
        let warehouseUps = [];
        for (const city of this.cities) {
          officeExps.push(this.ns.corporation.getOfficeSizeUpgradeCost(division, city, 3));
          warehouseUps.push(this.ns.corporation.getUpgradeWarehouseCost(division, city));
        }
        let officeExpCost = 0;
        let warehouseCost = 0;
        for (let i = 0; i < officeExps.length; i++) {
          officeExpCost += officeExps[i];
          warehouseCost += warehouseUps[i];
        }
        let y = Math.max(this.ns.corporation.getOffice(division, this.cities[0]).size, this.ns.corporation.getOffice(division, this.cities[1]).size, this.ns.corporation.getOffice(division, this.cities[2]).size, this.ns.corporation.getOffice(division, this.cities[3]).size, this.ns.corporation.getOffice(division, this.cities[4]).size, this.ns.corporation.getOffice(division, this.cities[5]).size);
        while (!officeExps.every((number) => number === officeExps[0])) {
          this.ns.print("found inbalance in officeExps for " + division + ". Correcting");
          this.ns.print("officeExps: " + officeExps);
          if (funds < officeExpCost) { this.ns.print("not enough funds to correct. awaiting income."); return; }
          for (const city of cities) {
            while (this.ns.corporation.getOffice(division, city).numEmployees < y) {
              this.ns.corporation.upgradeOfficeSize(division, city, 3);
              while (this.ns.corporation.hireEmployee(division, city)) { await this.ns.sleep(0); }
              funds = this.ns.corporation.getCorporation().funds * 0.5;
              await this.ns.sleep(0);
            }
          }
          officeExps = [];
          for (const city of this.cities) {
            officeExps.push(this.ns.corporation.getOfficeSizeUpgradeCost(division, city, 3));
          }
          officeExpCost = 0;
          for (let i = 0; i < officeExps.length; i++) {
            officeExpCost += officeExps[i];
          }
          y = Math.max(this.ns.corporation.getOffice(division, cities[0]).size, this.ns.corporation.getOffice(division, cities[1]).size, this.ns.corporation.getOffice(division, cities[2]).size, this.ns.corporation.getOffice(division, cities[3]).size, this.ns.corporation.getOffice(division, cities[4]).size, this.ns.corporation.getOffice(division, cities[5]).size);
          funds = this.ns.corporation.getCorporation().funds * 0.75;
          await this.ns.sleep(0);
        }
        let z = this.ns.corporation.getWarehouse(division, this.cities[0]).level;
        while (!warehouseUps.every((number) => number === warehouseUps[0])) {
          this.ns.print("found inbalance in warehouseUps for " + division + ". Correcting");
          this.ns.print("warehouseUps: " + warehouseUps);
          if (funds < warehouseUps) { this.ns.print("not enough funds to correct. awaiting income."); return; }
          for (const city of this.cities) {
            while (this.ns.corporation.getWarehouse(division, city).level < z) {
              this.ns.corporation.upgradeWarehouse(division, city);
              await this.ns.sleep(0);
            }
          }
          warehouseUps = [];
          for (const city of this.cities) {
            warehouseUps.push(this.ns.corporation.getUpgradeWarehouseCost(division, city));
          }
          warehouseCost = 0;
          for (let i = 0; i < warehouseUps.length; i++) {
            warehouseCost += warehouseUps[i];
          }
          funds = this.ns.corporation.getCorporation().funds * 0.75;
          await this.ns.sleep(0);
        }
        if ((funds * 0.8) / (divisions.length) >= officeExpCost) {
          this.ns.print("upgrading Office Sizes for all cities in " + division);
          for (const city of this.cities) {
            this.ns.corporation.upgradeOfficeSize(division, city, 3);
            while (this.ns.corporation.hireEmployee(division, city)) { await this.ns.sleep(0); }
          }
          funds = this.ns.corporation.getCorporation().funds * 0.75;
          await this.ns.sleep(0);
        }
        if ((funds * 0.2) / (divisions.length) >= warehouseCost) {
          this.ns.print("upgrading warehouses for all cities in " + division);
          for (const city of this.cities) {
            this.ns.corporation.upgradeWarehouse(division, city);
          }
          funds = this.ns.corporation.getCorporation().funds * 0.75;
          await this.ns.sleep(0);
        }
      }
    }
  }

  //function to assign employees to appropriate positions
  humanResources() {
    const prodCity = this.cities[0];
    const supportCities = [this.cities[1], this.cities[2], this.cities[3], this.cities[4], this.cities[5]];
    for (const division of this.ns.corporation.getCorporation().divisions) {
      if (this.divNames.restFraudNames.includes(division)) { continue; }
      if (this.divNames.restName == division && this.ns.corporation.getCorporation().funds < 1e21) { continue; }
      if (this.ns.corporation.getDivision(division).makesProducts) {
        if (this.ns.corporation.getOffice(division, prodCity).size > this.ns.corporation.getOffice(division, prodCity).numEmployees) { while (this.ns.corporation.hireEmployee(division, prodCity)) { } }
        for (const job of this.jobs) {
          this.ns.corporation.setAutoJobAssignment(division, prodCity, job, 0);
        }
        this.ns.corporation.setAutoJobAssignment(division, prodCity, this.jobs[4], 0);
        this.ns.corporation.setAutoJobAssignment(division, prodCity, this.jobs[5], 0);
        this.ns.corporation.setAutoJobAssignment(division, prodCity, this.jobs[0], Math.floor(this.ns.corporation.getOffice(division, prodCity).numEmployees / 3.5));
        this.ns.corporation.setAutoJobAssignment(division, prodCity, this.jobs[1], Math.floor(this.ns.corporation.getOffice(division, prodCity).numEmployees / 3.5));
        this.ns.corporation.setAutoJobAssignment(division, prodCity, this.jobs[2], Math.floor(0.5 * this.ns.corporation.getOffice(division, prodCity).numEmployees / 3.5));
        this.ns.corporation.setAutoJobAssignment(division, prodCity, this.jobs[3], Math.ceil(this.ns.corporation.getOffice(division, prodCity).numEmployees / 3.5));
        for (const city of supportCities) {
          if (this.ns.corporation.getOffice(division, city).size > this.ns.corporation.getOffice(division, city).numEmployees) { while (this.ns.corporation.hireEmployee(division, city)) { } }
          for (const job of this.jobs) {
            this.ns.corporation.setAutoJobAssignment(division, city, job, 0);
          }
          this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[5], 0);
          this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[0], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 20), 1));
          this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[1], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 20), 1));
          this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[2], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 20), 1));
          if (this.ns.corporation.getOffice(division, city).numEmployees <= 3) { continue; }
          this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[3], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 20), 1));
          let rdNum = 0;
          try { while (this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[4], rdNum++)) { } } catch { };
        }
      }
      else {
        for (const city of this.cities) {
          if (this.ns.corporation.getOffice(division, city).size > this.ns.corporation.getOffice(division, city).numEmployees) { while (this.ns.corporation.hireEmployee(division, city)) { } }
          for (const job of this.jobs) {
            this.ns.corporation.setAutoJobAssignment(division, city, job, 0);
          }
          this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[5], 0);
          this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[0], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 5), 1));
          this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[2], Math.max(Math.floor(0.5 * this.ns.corporation.getOffice(division, city).numEmployees / 5), 1));
          this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[3], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 5), 1));
          this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[4], Math.max(Math.floor(this.ns.corporation.getOffice(division, city).numEmployees / 5), 1));
          let engNum = 0;
          try { while (this.ns.corporation.setAutoJobAssignment(division, city, this.jobs[1], engNum++)) { } } catch { };
        }
      }
    }
  }

  //function to spend research points
  rAndD() {
    const rdNames = ["Hi-Tech R&D Laboratory", "Market-TA.I", "Market-TA.II", "Automatic Drug Administration", "Go-Juice", "Overclock", "Sti.mu", "CPH4 Injections", "Drones", "Drones - Assembly", "Drones - Transport", "Self-Correcting Assemblers", "AutoBrew", "AutoPartyManager"];
    const prodrdNames = ["uPgrade: Fulcrum", "uPgrade: Capacity.I", "uPgrade: Dashboard"];
    for (const division of this.ns.corporation.getCorporation().divisions) {
      if (this.ns.corporation.getDivision(division).researchPoints > 12000 && !this.ns.corporation.hasResearched(division, rdNames[0])) { this.ns.print("purchasing research: " + rdNames[0] + " in " + division); this.ns.corporation.research(division, rdNames[0]); }
      if (!this.ns.corporation.hasResearched(division, rdNames[0])) { continue; }
      if (this.ns.corporation.getDivision(division).researchPoints > 1.4e5 && !this.ns.corporation.hasResearched(division, rdNames[2])) { this.ns.print("purchasing research: " + rdNames[2] + " in " + division); this.ns.corporation.research(division, rdNames[1]); this.ns.corporation.research(division, rdNames[2]); }
      if (!this.ns.corporation.hasResearched(division, rdNames[2])) { continue; }
      if (this.ns.corporation.getDivision(division).researchPoints > 1.5e5 && !this.ns.corporation.hasResearched(division, rdNames[4])) { this.ns.print("purchasing research: " + rdNames[4] + " in " + division); this.ns.corporation.research(division, rdNames[3]); this.ns.corporation.research(division, rdNames[4]); }
      if (!this.ns.corporation.hasResearched(division, rdNames[4])) { continue; }
      if (this.ns.corporation.getDivision(division).researchPoints > 1.5e5 && !this.ns.corporation.hasResearched(division, rdNames[6])) { this.ns.print("purchasing research: " + rdNames[6] + " in " + division); this.ns.corporation.research(division, rdNames[5]); this.ns.corporation.research(division, rdNames[6]); }
      if (!this.ns.corporation.hasResearched(division, rdNames[6])) { continue; }
      if (this.ns.corporation.getDivision(division).researchPoints > 1e5 && !this.ns.corporation.hasResearched(division, rdNames[7])) { this.ns.print("purchasing research: " + rdNames[7] + " in " + division); this.ns.corporation.research(division, rdNames[7]); }
      for (const name of rdNames) {
        if (this.ns.corporation.getDivision(division).researchPoints >= this.ns.corporation.getResearchCost(division, name) * 30 && !this.ns.corporation.hasResearched(division, name)) { this.ns.print("purchasing research: " + name + " in " + division); this.ns.corporation.research(division, name); }
      }
      if (this.ns.corporation.getDivision(division).makesProducts) {
        if (this.ns.corporation.getDivision(division).researchPoints >= (this.ns.corporation.getResearchCost(division, prodrdNames[0]) * 3.5) * 30) {
          for (const name of prodrdNames) { this.ns.print("purchasing research: " + name + " in " + division); this.ns.corporation.research(division, name); }
        }
      }
    }
  }

  //function to set prices
  setPrices() {
    for (const division of this.ns.corporation.getCorporation().divisions) {
      const divType = this.ns.corporation.getDivision(division).type;
      const divData = this.ns.corporation.getIndustryData(divType);
      for (const city of this.cities) {
        if (this.ns.corporation.getDivision(division).makesProducts) {
          const prods = this.ns.corporation.getDivision(division).products
          for (const prod of prods) {
            const prodData = this.ns.corporation.getProduct(division, city, prod);
            if (prodData.developmentProgress < 100 && !this.ns.corporation.hasResearched(division, "uPgrade: Dashboard")) { continue; }
            if (this.ns.corporation.hasResearched(division, "Market-TA.II")) {
              this.ns.corporation.sellProduct(division, city, prod, "MAX", "MP", true);
              this.ns.corporation.setProductMarketTA2(division, prod, true);
            } else { //this logic is terrible, but will do the trick. market-TA.II is too good.
              let x = 1;
              if (typeof prodData.desiredSellPrice === "string") {
                if (parseFloat(prodData.desiredSellPrice.slice(3)) != null && parseFloat(prodData.desiredSellPrice.slice(3)) > 0) {
                  x = parseFloat(prodData.desiredSellPrice.slice(3));
                  if (prodData.stored === 0) {
                    x *= 2;
                  } else {
                    const buffer = Math.max(prodData.productionAmount, 1) / 10;
                    const desired = prodData.stored - buffer == 0 ? prodData.stored - buffer : 1;
                    const xMult = Math.max(0.33, Math.sqrt(prodData.actualSellAmount / desired));
                    x *= xMult;
                  }
                }
              }
              if (!x > 0) { this.nstprint("x tried to be " + x + " for " + prod + " in " + division + ", " + city + ". correcting to 1"); x = 1; }
              this.ns.corporation.sellProduct(division, city, prod, "MAX", "MP*" + x, true);
            }
          }
        }
        if (divData.producedMaterials) {
          for (const mat of divData.producedMaterials) {
            const matData = this.ns.corporation.getMaterial(division, city, mat);
            const matConst = this.ns.corporation.getMaterialData(mat);
            if (this.ns.corporation.hasResearched(division, "Market-TA.II")) {
              this.ns.corporation.sellMaterial(division, city, mat, "MAX", "MP");
              this.ns.corporation.setMaterialMarketTA2(division, city, mat, true);
            } else { this.ns.corporation.sellMaterial(division, city, mat, "MAX", matData.marketPrice + (matData.quality / matConst.baseMarkup)); }
          } //the above line is perfect logic for materials. it's effectively market.TA.I.
        }
      }
    }
  }

  //function to manage exports
  marketPlace() {
    const divNames = ["AgriCorp", "CamelCorp", "AquaCorp", "ChemCorp", "GoronCorp", "ForgeCorp", "MicroCorp", "SkyNetCorp", "RobotnicCorp", "ZoraCorp", "PharmaCorp", "HeartCorp", "CoiCorp", "DelTacoCorp", "JeffGoldblumCorp"];
    const mats = ["Food", "Plants", "Water", "Chemicals", "Drugs", "Ore", "Metal", "Hardware", "AI Cores", "Robots", "Real Estate"];
    const divisions = this.ns.corporation.getCorporation().divisions;
    for (const city of this.cities) {
      for (const mat of mats) { //this clears existing imports because the current game will allow infinite duplicates.
        for (const div of divisions) {
          const exports = this.ns.corporation.getMaterial(div, city, mat).exports;
          for (const exp of exports) {
            this.ns.corporation.cancelExportMaterial(div, city, exp.division, exp.city, mat, exp.amount);
          }
        }
      }
      if (divisions.includes(divNames[1])) {
        if (divisions.includes(divNames[1])) { this.ns.corporation.exportMaterial(divNames[0], city, divNames[1], city, "Plants", "(IINV+IPROD)*(-1)"); } //"(IINV+IPROD)*(-1)" 
      }
      if (divisions.includes(divNames[2])) {
        if (divisions.includes(divNames[0])) { this.ns.corporation.exportMaterial(divNames[2], city, divNames[0], city, "Water", "(IINV+IPROD)*(-1)"); }
      }
      if (divisions.includes(divNames[3])) {
        if (divisions.includes(divNames[0])) {
          this.ns.corporation.exportMaterial(divNames[0], city, divNames[3], city, "Plants", "(IINV+IPROD)*(-1)");
          this.ns.corporation.exportMaterial(divNames[3], city, divNames[0], city, "Chemicals", "(IINV+IPROD)*(-1)");
        }
        if (divisions.includes(divNames[2])) { this.ns.corporation.exportMaterial(divNames[2], city, divNames[3], city, "Water", "(IINV+IPROD)*(-1)"); }
      }
      if (divisions.includes(divNames[5])) {
        this.ns.corporation.exportMaterial(divNames[4], city, divNames[5], city, "Ore", "(IINV+IPROD)*(-1)");
      }
      if (divisions.includes(divNames[6])) {
        this.ns.corporation.exportMaterial(divNames[5], city, divNames[6], city, "Metal", "(IINV+IPROD)*(-1)");
        for (let i = 0; i < divisions.length; i++) {
          switch (divNames[i]) {
            case divNames[6]:
              break;
            case divNames[7]:
            case divNames[8]:
            case divNames[9]:
              if (divisions.includes(divNames[i])) { this.ns.corporation.exportMaterial(divNames[6], city, divNames[i], city, "Hardware", "(IINV+IPROD)*(-1)"); }
              break;
            default:
              this.ns.corporation.exportMaterial(divNames[6], city, divNames[i], city, "Hardware", "(EPROD/10)/" + ((divNames.length * cities.length) * 10));
              break;
          }
        }
      }
      if (divisions.includes(divNames[7])) {
        for (let i = 0; i < divisions.length; i++) {
          switch (divNames[i]) {
            case divNames[7]:
              break;
            case divNames[8]:
              if (divisions.includes(divNames[i])) { this.ns.corporation.exportMaterial(divNames[7], city, divNames[i], city, "AI Cores", "(IINV+IPROD)*(-1)"); }
              break;
            default:
              this.ns.corporation.exportMaterial(divNames[7], city, divNames[i], city, "AI Cores", "(EPROD/10)/" + ((divNames.length * cities.length) * 5));
              break;
          }
        }
      }
      if (divisions.includes(divNames[8])) {
        this.ns.corporation.exportMaterial(divNames[7], city, divNames[8], city, "AI Cores", "(IINV+IPROD)*(-1)");
        for (let i = 0; i < divisions.length; i++) {
          switch (divNames[i]) {
            case divNames[8]:
              break;
            case divNames[11]:
              this.ns.corporation.exportMaterial(divNames[6], city, divNames[i], city, "Robots", "(IINV+IPROD)*(-1)");
              break;
            default:
              this.ns.corporation.exportMaterial(divNames[6], city, divNames[i], city, "Robots", "(EPROD/10)/" + ((divNames.length * cities.length) * 10));
              break;
          }
        }
      }
      if (divisions.includes(divNames[9])) {
        this.ns.corporation.exportMaterial(divNames[9], city, divNames[0], city, "Water", "(IINV+IPROD)*(-1)");
        this.ns.corporation.exportMaterial(divNames[9], city, divNames[3], city, "Water", "(IINV+IPROD)*(-1)");
      }
      if (divisions.includes(divNames[10])) {
        this.ns.corporation.exportMaterial(divNames[3], city, divNames[10], city, "Chemicals", "(IINV+IPROD)*(-1)");
        this.ns.corporation.exportMaterial(divNames[2], city, divNames[10], city, "Water", "(IINV+IPROD)*(-1)");
        this.ns.corporation.exportMaterial(divNames[9], city, divNames[10], city, "Water", "(IINV+IPROD)*(-1)");
      }
      if (divisions.includes(divNames[11])) {
        this.ns.corporation.exportMaterial(divNames[0], city, divNames[11], city, "Food", "(IINV+IPROD)*(-1)");
        this.ns.corporation.exportMaterial(divNames[10], city, divNames[11], city, "Drugs", "(IINV+IPROD)*(-1)");
      }
      if (divisions.includes(divNames[12])) {
        this.ns.corporation.exportMaterial(divNames[0], city, divNames[12], city, "Plants", "(IINV+IPROD)*(-1)");
        this.ns.corporation.exportMaterial(divNames[12], city, divNames[11], city, "Food", "(IINV+IPROD)*(-1)");
      }
      if (divisions.includes(divNames[13])) {
        if (divisions.includes(divNames[0])) { this.ns.corporation.exportMaterial(divNames[0], city, divNames[13], city, "Food", "(IINV+IPROD)*(-1)"); }
        if (divisions.includes(divNames[12])) { this.ns.corporation.exportMaterial(divNames[12], city, divNames[13], city, "Food", "(IINV+IPROD)*(-1)"); }
        if (divisions.includes(divNames[3])) { this.ns.corporation.exportMaterial(divNames[3], city, divNames[13], city, "Water", "(IINV+IPROD)*(-1)"); }
        if (divisions.includes(divNames[9])) { this.ns.corporation.exportMaterial(divNames[9], city, divNames[13], city, "Water", "(IINV+IPROD)*(-1)"); }
      }
      if (divisions.includes(divNames[14])) {
        this.ns.corporation.exportMaterial(divNames[0], city, divNames[14], city, "Plants", "(IINV+IPROD)*(-1)");
        this.ns.corporation.exportMaterial(divNames[6], city, divNames[14], city, "Hardware", "(IINV+IPROD)*(-1)");
        this.ns.corporation.exportMaterial(divNames[3], city, divNames[14], city, "Water", "(IINV+IPROD)*(-1)");
        this.ns.corporation.exportMaterial(divNames[9], city, divNames[14], city, "Water", "(IINV+IPROD)*(-1)");
        this.ns.corporation.exportMaterial(divNames[5], city, divNames[14], city, "Metal", "(IINV+IPROD)*(-1)");
        for (let i = 0; i < divisions.length; i++) {
          switch (divNames[i]) {
            case divNames[14]:
              break;
            default:
              this.ns.corporation.exportMaterial(divNames[14], city, divNames[i], city, "Real Estate", "(EPROD/10)/" + ((divNames.length * cities.length) * 10));
              break;
          }
        }
      }
    }
  }

  //function to create products continuously
  makeProd() {
    const divNames = ["CamelCorp", "MicroCorp", "SkyNetCorp", "RobotnicCorp", "PharmaCorp", "HeartCorp", "DelTacoCorp", "JeffGoldblumCorp"];
    const prodNames = ["Tobacco v", "Asus v", "Jarvis v", "Chappy v", "CureAll v", "Kaiser #", "DelTaco #", "Apartments #"];
    const divisions = this.ns.corporation.getCorporation().divisions;
    for (let i = 0; i < divNames.length; i++) {
      if (!divisions.includes(divNames[i])) { continue; }
      if (divNames[i] == this.divNames.restName && this.ns.corporation.getCorporation().funds < 1e21) { continue; }
      const prodMax = this.ns.corporation.hasResearched(divNames[i], "uPgrade: Capacity.I") ? 4 : 3;
      let products = this.ns.corporation.getDivision(divNames[i]).products;
      let version = (this.ns.corporation.getDivision(divNames[i]).products.length > 0) ? parseInt(products.at(-1).at(-1)) + 1 : 1;
      if (products.length >= prodMax && this.ns.corporation.getProduct(divNames[i], this.cities[0], products[prodMax - 1]).developmentProgress < 100) { continue; }
      if (products[0]?.developmentProgress < 100 || products[1]?.developmentProgress < 100 || products[2]?.developmentProgress < 100) { continue; }
      if (products.length >= prodMax && this.ns.corporation.getProduct(divNames[i], this.cities[0], products[prodMax - 1]).developmentProgress >= 100) { this.ns.corporation.discontinueProduct(divNames[i], products[0]); }
      this.ns.corporation.makeProduct(divNames[i], this.cities[0], (prodNames[i] + version), Math.abs(this.ns.corporation.getCorporation().funds * 0.01), Math.abs(this.ns.corporation.getCorporation().funds * 0.01));
      this.ns.print("started new product in " + divNames[i] + ", product: " + (prodNames[i] + version) + " - funding: " + this.ns.formatNumber((Math.abs(this.ns.corporation.getCorporation().funds * 0.01) * 2), 3));
    }
  }

  //function to purchase corp-wide upgrades.
  async corpPurchases() {
    const upgradeFunds = this.ns.corporation.getCorporation().funds;
    if (!this.ns.corporation.hasUnlock("Export") && upgradeFunds > this.ns.corporation.getUnlockCost("Export")) { this.ns.corporation.purchaseUnlock("Export"); }
    if (!this.ns.corporation.hasUnlock("Smart Supply") && upgradeFunds > this.ns.corporation.getUnlockCost("Smart Supply") * 10) {
      this.ns.corporation.purchaseUnlock("Smart Supply");
      for (const division of this.ns.corporation.getCorporation().divisions) {
        for (const city of this.ns.corporation.getDivision(division).cities) {
          this.ns.corporation.setSmartSupply(division, city, true);
        }
      }
    }
    //this.lvlUps = ["Smart Factories", "Smart Storage", "FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants", "Wilson Analytics", "Project Insight", "ABC SalesBots", "DreamSense"];
    const wilsonCost = this.ns.corporation.getUpgradeLevelCost(this.lvlUps[6]);
    const labCost = this.ns.corporation.getUpgradeLevelCost(this.lvlUps[7]);
    const abcCost = this.ns.corporation.getUpgradeLevelCost(this.lvlUps[8]);
    while (this.ns.corporation.getUpgradeLevel(this.lvlUps[0]) != this.ns.corporation.getUpgradeLevel(this.lvlUps[1])) {
      if (this.ns.corporation.getUpgradeLevel(this.lvlUps[0]) < this.ns.corporation.getUpgradeLevel(this.lvlUps[1])) {
        this.ns.corporation.levelUpgrade(this.lvlUps[0]);
      }
      else {
        this.ns.corporation.levelUpgrade(this.lvlUps[1]);
      }
      await this.ns.sleep(0);
    }
    const factCost = this.ns.corporation.getUpgradeLevelCost(this.lvlUps[0]) + this.ns.corporation.getUpgradeLevelCost(this.lvlUps[1]);
    let augLevels = [];
    for (let i = 2; i < 6; i++) {
      augLevels.push(this.ns.corporation.getUpgradeLevel(this.lvlUps[i]));
    }
    while (!augLevels.every((number) => number === augLevels[0])) {
      this.ns.print("employee augment upgrades imbalanced. correcting");
      this.ns.print("augLevels: " + augLevels);
      await this.ns.sleep(0);
      while (this.ns.corporation.getUpgradeLevel(this.lvlUps[2]) < this.ns.corporation.getUpgradeLevel(this.lvlUps[3]) || this.ns.corporation.getUpgradeLevel(this.lvlUps[2]) < this.ns.corporation.getUpgradeLevel(this.lvlUps[4]) || this.ns.corporation.getUpgradeLevel(this.lvlUps[2]) < this.ns.corporation.getUpgradeLevel(this.lvlUps[5])) {
        this.ns.corporation.levelUpgrade(this.lvlUps[2]);
        await this.ns.sleep(0);
      }
      while (this.ns.corporation.getUpgradeLevel(this.lvlUps[2]) > this.ns.corporation.getUpgradeLevel(this.lvlUps[3])) {
        this.ns.corporation.levelUpgrade(this.lvlUps[3]);
        await this.nssleep(0);
      }
      while (this.ns.corporation.getUpgradeLevel(this.lvlUps[2]) > this.ns.corporation.getUpgradeLevel(this.lvlUps[4])) {
        this.ns.corporation.levelUpgrade(this.lvlUps[4]);
        await this.ns.sleep(0);
      }
      while (this.ns.corporation.getUpgradeLevel(this.lvlUps[2]) > this.ns.corporation.getUpgradeLevel(this.lvlUps[5])) {
        this.ns.corporation.levelUpgrade(this.lvlUps[5]);
        await this.ns.sleep(0);
      }
      augLevels = [];
      for (let i = 2; i < 6; i++) {
        augLevels.push(this.ns.corporation.getUpgradeLevel(this.lvlUps[i]));
      }
      await this.ns.sleep(0);
    }
    const employeeUpCost = this.ns.corporation.getUpgradeLevelCost(this.lvlUps[2]) + this.ns.corporation.getUpgradeLevelCost(this.lvlUps[3]) + this.ns.corporation.getUpgradeLevelCost(this.lvlUps[4]) + this.ns.corporation.getUpgradeLevelCost(this.lvlUps[5]);
    if (upgradeFunds > wilsonCost) { this.ns.print("buying " + this.lvlUps[6] + " upgrade"); this.ns.corporation.levelUpgrade(this.lvlUps[6]); return; }
    if (upgradeFunds < employeeUpCost) { return; }
    if (employeeUpCost / 2 > labCost) { this.ns.print("buying " + this.lvlUps[7] + " upgrade"); this.ns.corporation.levelUpgrade(this.lvlUps[7]); return; }
    if (employeeUpCost > factCost) { this.ns.print("buying " + this.lvlUps[0] + " and " + this.lvlUps[1] + "upgrades"); this.ns.corporation.levelUpgrade(this.lvlUps[0]); this.ns.corporation.levelUpgrade(this.lvlUps[1]); return; }
    if (upgradeFunds > abcCost) { this.ns.print("buying " + this.lvlUps[8] + " upgrade"); this.ns.corporation.levelUpgrade(this.lvlUps[8]); return; }
    if (upgradeFunds * 0.5 > this.ns.corporation.getUpgradeLevelCost(this.lvlUps[9])) { this.ns.print("buying " + this.lvlUps[9] + " upgrade"); this.ns.corporation.levelUpgrade(this.lvlUps[9]); return; }
    this.ns.print("buying employee augment upgrades");
    for (let i = 2; i < 6; i++) {
      this.ns.corporation.levelUpgrade(this.lvlUps[i]);
    }
  }

  //function to expand to other industries.
  expansionPlan() {
    //agri, tob, chem first. spring water second. ore, refinery, hardware 3rd, software and robotics 4th, everything else after.
    //currently expecting 1 of every division an eventuality, because exporting is fun.
    let funds = this.ns.corporation.getCorporation().funds;
    const divisionNames = ["AgriCorp", "CamelCorp", "AquaCorp", "ChemCorp", "GoronCorp", "ForgeCorp", "MicroCorp", "SkyNetCorp", "RobotnicCorp", "ZoraCorp", "PharmaCorp", "HeartCorp", "CoiCorp", "DelTacoCorp", "JeffGoldblumCorp"];
    const divisionTypes = ["Agriculture", "Tobacco", "Spring Water", "Chemical", "Mining", "Refinery", "Computer Hardware", "Software", "Robotics", "Water Utilities", "Pharmaceutical", "Healthcare", "Fishing", "Restaurant", "Real Estate"];
    const divisionFundsReq = [6e10, 7e10, 1e21, 7.5e11, 1e18, 1e18, 1e18, 1e21, 1e21, 1e24, 1e24, 1e24, 1e24, 1e24, 1e24];
    const divisions = this.ns.corporation.getCorporation().divisions;
    for (let i = 0; i < divisionNames.length; i++) {
      if (funds >= divisionFundsReq[i] && !divisions.includes(divisionNames[i])) {
        this.ns.corporation.expandIndustry(divisionTypes[i], divisionNames[i]);
        for (const city of this.cities) {
          if (!this.ns.corporation.getDivision(divisionNames[i]).cities.includes(city)) { this.ns.corporation.expandCity(divisionNames[i], city); }
          if (!this.ns.corporation.hasWarehouse(divisionNames[i], city)) { this.ns.corporation.purchaseWarehouse(divisionNames[i], city); }
          funds = this.ns.corporation.getCorporation().funds;
        }
      }
    }
    if (funds > 1e40 && !this.ns.corporation.getCorporation().public) {
      if (!this.ns.corporation.hasUnlock("Government Partnership")) { this.ns.corporation.purchaseUnlock("Government Partnership"); }
      if (!this.ns.corporation.hasUnlock("Shady Accounting")) { this.ns.corporation.purchaseUnlock("Shady Accounting"); }
      this.ns.corporation.goPublic(0);
      this.ns.corporation.issueDividends(0.001);
    }
  }

  //function to check all the warehouses in each division to make sure we have space to produce and sell
  warehouseSafety() {
    for (const division of this.ns.corporation.getCorporation().divisions) {
      for (const city of this.cities) {
        const warehouse = this.ns.corporation.getWarehouse(division, city)
        if (warehouse.sizeUsed >= warehouse.size * 0.95) {
          let x = warehouse.sizeUsed
          for (const mat of this.mats) {
            const matData = this.ns.corporation.getMaterial(division, city, mat);
            const matConst = this.ns.corporation.getMaterialData(mat);
            const spaceTaken = matData.stored * matConst.size;
            if (spaceTaken >= x * 0.1) {
              this.ns.corporation.sellMaterial(division, city, mat, "MAX*0.5", "MP*0.1");
            }
          }
        }
      }
    }
  }

  //function to buy boost materials for divisions that benefit from them, specifically agriculture
  boostPurchase() {
    //we want graduating amounts. first some right off the bat values
    //then medium amounts, usually including warehouse purchases up to a limit
    //until the divisions that produce higher quality boost materials get pumping.
    const boostOrder = ["AI Cores", "Hardware", "Real Estate", "Robots"];
    const divBoost = { //data map that will organize purchase orders.
      agri: { //based entirely off Jeeks. I owe him and jakob entirely too much.
        name: "AgriCorp",
        first: [952, 1059, 68252, 0], //500
        second: [6106, 6785, 317160, 793], //2500
        third: [19864, 22071, 936568, 4013] //10000
      },
      chem: {
        name: "ChemCorp",
        first: [1394, 2324, 44232, 0],
        second: [7032, 11727, 191236, 1274],
        third: [22537, 37562, 549316, 5492],
      },
      tob: {
        name: "CamelCorp",
        first: [1543, 2573, 38264, 0],
        second: [7293, 12159, 154132, 1541],
        third: [23400, 39000, 425700, 6383]
      },
      sprng: {
        name: "AquaCorp",
        first: [1339, 0, 73220, 0],
        second: [9680, 0, 406400, 0],
        third: [33008, 500, 1339840, 500]
      }
    };
    for (const division of this.ns.corporation.getCorporation().divisions) {
      if (this.ns.corporation.getCorporation().funds < this.ns.corporation.getUpgradeWarehouseCost(division, this.cities[0], 1) * 6) { continue; }
      for (const city of this.ns.corporation.getDivision(division).cities) {
        for (const div of Object.values(divBoost)) {
          if (division != div.name) { continue; }
          //first increase warehouse. buffer for production and required materials 
          //should be 50% and boost space should be 50% roughly
          if (this.ns.corporation.getWarehouse(division, city).size < 1000 && this.ns.corporation.getCorporation().funds > this.ns.corporation.getUpgradeWarehouseCost(division, city)) { while (this.ns.corporation.getCorporation().funds > this.ns.corporation.getUpgradeWarehouseCost(division, city) && this.ns.corporation.getWarehouse(division, city).size < 1000) { this.ns.corporation.upgradeWarehouse(division, city); } }
          if (this.ns.corporation.getWarehouse(division, city).size < 1000) { continue; }
          for (let i = 0; i < 4; i++) {
            if (this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored < div.first[i]) {
              try { this.ns.corporation.bulkPurchase(division, city, boostOrder[i], div.first[i] - this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored); } catch { }
            }
          }
          if (this.ns.corporation.getWarehouse(division, city).size < 5000 && this.ns.corporation.getCorporation().funds > this.ns.corporation.getUpgradeWarehouseCost(division, city)) { while (this.ns.corporation.getCorporation().funds > this.ns.corporation.getUpgradeWarehouseCost(division, city) && this.ns.corporation.getWarehouse(division, city).size < 5000) { this.ns.corporation.upgradeWarehouse(division, city); } }
          if (this.ns.corporation.getWarehouse(division, city).size < 5000) { continue; }
          for (let i = 0; i < 4; i++) {
            if (this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored < div.second[i]) {
              try { this.ns.corporation.bulkPurchase(division, city, boostOrder[i], div.second[i] - this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored); } catch { }
            }
          }
          if (this.ns.corporation.getWarehouse(division, city).size < 20000 && this.ns.corporation.getCorporation().funds > this.ns.corporation.getUpgradeWarehouseCost(division, city)) { while (this.ns.corporation.getCorporation().funds > this.ns.corporation.getUpgradeWarehouseCost(division, city) && this.ns.corporation.getWarehouse(division, city).size < 20000) { this.ns.corporation.upgradeWarehouse(division, city); } }
          if (this.ns.corporation.getWarehouse(division, city).size < 20000) { continue; }
          for (let i = 0; i < 4; i++) {
            if (this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored < div.third[i]) {
              try { this.ns.corporation.bulkPurchase(division, city, boostOrder[i], div.third[i] - this.ns.corporation.getMaterial(division, city, boostOrder[i]).stored); } catch { }
            }
          }
        }
      }
    }
  }

  //function to make the log pretty
  logPrint() {
    this.ns.resizeTail(300, 250);
    this.ns.clearLog();
    this.ns.print("Corporation: " + this.ns.corporation.getCorporation().name);
    this.ns.print("Divisions: " + this.ns.corporation.getCorporation().divisions.length);
    this.ns.print("Earnings: " + this.ns.formatNumber(this.ns.corporation.getCorporation().revenue));
    this.ns.print("Expenses: " + this.ns.formatNumber(this.ns.corporation.getCorporation().expenses));
    this.ns.print("Profit: " + this.ns.formatNumber(this.ns.corporation.getCorporation().revenue - this.ns.corporation.getCorporation().expenses));
    this.ns.print("Funds: " + this.ns.formatNumber(this.ns.corporation.getCorporation().funds, 3));
    if (this.ns.corporation.getInvestmentOffer().round < 4 && !this.ns.corporation.getCorporation().public) { this.ns.print("Investment offers accepted: " + (this.ns.corporation.getInvestmentOffer().round - 1)); } else if (!this.ns.corporation.getCorporation().public) { this.ns.print("All investment offers accepted."); } else { this.ns.print("Gone public: True"); }
    if (this.ns.corporation.getInvestmentOffer().round < 4 && !this.ns.corporation.getCorporation().public) { this.ns.print("Round " + this.ns.corporation.getInvestmentOffer().round + " Inv Offer: " + this.ns.formatNumber(this.ns.corporation.getInvestmentOffer().funds, 3)); }
    this.ns.print("Shares owned: " + this.ns.formatNumber(this.ns.corporation.getCorporation().numShares));
    if (this.ns.corporation.getCorporation().public) { this.ns.print("Dividends: " + this.ns.corporation.getCorporation().dividendEarnings); }
  }
}

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.tail();
  const bus = new Business(ns);
  bus.checkStage(); //function to figure out what stage/stage the corp is at

  while (bus.stage[0] < 10) { //this is the this.step 0-9
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

  bus.expansionPlan();

  while (bus.stage[0] >= 10) { //this is the to the moon loop.
    while (ns.corporation.getCorporation().state != "START") {
      //when you make your main script, put things you want to be done
      //potentially multiple times every cycle, like buying upgrades, here.
      await bus.corpPurchases();
      await bus.divisPurchases();
      await ns.sleep(0);
    }

    while (ns.corporation.getCorporation().state == "START") {
      //same as above
      await ns.sleep(0);
    }
    //and to this part put things you want done exactly once per cycle
    bus.expansionPlan();
    bus.boostPurchase();
    bus.setPrices();
    bus.makeProd();
    bus.rAndD();
    bus.humanResources();
    bus.marketPlace();
    bus.warehouseSafety();
    bus.dumbSupply();
    bus.teaParty();
    bus.logPrint();
  }


}
