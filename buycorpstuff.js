//function to buy division-specific purchases
/** @param {NS} ns */
export function divisPurchases(ns) {
  const funds = ns.corporation.getCorporation().funds * 0.75;
  const prodCity = "Aevum";
  const supportCities = ["Sector-12", "Chongqing", "New Tokyo", "Ishima", "Volhaven"]
  const divisions = ns.corporation.getCorporation().divisions
  for (const division of divisions) {
    if (ns.corporation.getDivision(division).makesProducts) {
      let advertCost = ns.corporation.getHireAdVertCost(division);
      let officeExpCost = ns.corporation.getOfficeSizeUpgradeCost(division, prodCity, 15);
      let supportExps = [];
      let supportWHs = [];
      for (const city of supportCities) {
        supportExps.push(ns.corporation.getOfficeSizeUpgradeCost(division, city, 15));
        supportWHs.push(ns.corporation.getUpgradeWarehouseCost(division, city));
      }
      let supportExpCost = 0;
      let supportWHCost = 0;
      for (let i = 0; i < supportExps.length; i++) {
        supportExpCost += supportExps[i];
        supportWHCost += supportWHs[i];
      }
      let y = 15;
      while (!supportExps.reduce((a, x) => a == x)) {
        if (funds < supportExpCost) { return; }
        for (city of supportCities) {
          while (ns.corporation.getOffice(division, city).numEmployees < y) {
            ns.corporation.upgradeOfficeSize(division, city, 3);
            while (ns.corporation.hireEmployee(division, city)) { }
          }
        }
        y += 15;
      }
      let z = ns.corporation.getWarehouse(division, prodCity).level;
      while (!supportWHs.reduce((a, x) => a == x)) {
        if (funds < supportWHCost) { return; }
        for (city of supportCities) {
          while (ns.corporation.getWarehouse(division, city).level < z) {
            ns.corporation.upgradeWarehouse(division, city);
          }
        }
      }
      while (funds / divisions.length >= advertCost) {
        if (officeExpCost > advertCost) { ns.corporation.hireAdVert(division); }
        if (officeExpCost < advertCost) {
          if (officeExpCost < supportExpCost) {
            ns.corporation.upgradeOfficeSize(division, prodCity, 15);
            while (ns.corporation.hireEmployee(division, prodCity)) { }
          }
          else {
            for (const city of supportCities) {
              ns.corporation.upgradeOfficeSize(division, city, 15);
              while (ns.corporation.hireEmployee(division, city)) { }
            }
          }
        }
      }
      while (funds / divisions.length * 24 >= ns.corporation.getUpgradeWarehouseCost(division, supportCities[0])) {
        ns.corporation.upgradeWarehouse(division, prodCity);
        for (const city of supportCities) {
          ns.corporation.upgradeWarehouse(division, city);
        }
      }
    }
    else {
      const cities = ["Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven", "Sector-12"];
      let officeExps = [];
      let warehouseUps = [];
      for (const city of cities) {
        officeExps.push(ns.corporation.getOfficeSizeUpgradeCost(division, city, 15));
        warehouseUps.push(ns.corporation.getUpgradeWarehouseCost(division, city));
      }
      let officeExpCost = 0;
      let warehouseCost = 0;
      for (let i = 0; i < officeExps.length; i++) {
        officeExpCost += officeExps[i];
        warehouseCost += warehouseUps[i];
      }
      let y = 15;
      while (!officeExps.reduce((a, x) => a == x)) {
        if (funds < officeExpCost * 1.5) { return; }
        for (city of cities) {
          while (ns.corporation.getOffice(division, city).numEmployees < y) {
            ns.corporation.upgradeOfficeSize(division, city, 3);
            while (ns.corporation.hireEmployee(division, city)) { }
          }
        }
        y += 15;
      }
      let z = ns.corporation.getWarehouse(division, cities[0]).level;
      while (!supportWHs.reduce((a, x) => a == x)) {
        if (funds < supportWHCost) { return; }
        for (city of supportCities) {
          while (ns.corporation.getWarehouse(division, city).level < z) {
            ns.corporation.upgradeWarehouse(division, city);
          }
        }
      }
      while (funds / divisions.length * 1.5 >= officeExpCost) {
        for (const city of cities) {
          ns.corporation.upgradeOfficeSize(division, city, 15);
          while (ns.corporation.hireEmployee(division, city)) { }
        }
      }
      while (funds / divisions.length * 24 >= ns.corporation.getUpgradeWarehouseCost(division, cities[0])) {
        for (const city of supportCities) {
          ns.corporation.upgradeWarehouse(division, city);
        }
      }
    }
  }
}

//function to assign employees to appropriate positions
/** @param {NS} ns */
export function humanResources(ns) {
  const cities = ["Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven", "Sector-12"];
  const prodCity = "Aevum";
  const supportCities = ["Sector-12", "Chongqing", "New Tokyo", "Ishima", "Volhaven"]
  const jobs = ["Operations", "Engineer", "Business", "Management", "Research & Development", "Intern"];
  for (const division of ns.corporation.getCorporation().divisions) {
    if (ns.corporation.getDivision(division).makesProducts) {
      ns.corporation.setAutoJobAssignment(division, prodCity, jobs[4], 0);
      ns.corporation.setAutoJobAssignment(division, prodCity, jobs[5], 0);
      ns.corporation.setAutoJobAssignment(division, prodCity, jobs[0], Math.floor(ns.corporation.getOffice(division, prodCity).numEmployees / 3.5));
      ns.corporation.setAutoJobAssignment(division, prodCity, jobs[1], Math.floor(ns.corporation.getOffice(division, prodCity).numEmployees / 3.5));
      ns.corporation.setAutoJobAssignment(division, prodCity, jobs[2], Math.floor(0.5 * ns.corporation.getOffice(division, prodCity).numEmployees / 3.5));
      ns.corporation.setAutoJobAssignment(division, prodCity, jobs[3], Math.ceil(ns.corporation.getOffice(division, prodCity).numEmployees / 3.5));
      for (const city of supportCities) {
        ns.corporation.setAutoJobAssignment(division, city, jobs[5], 0);
        ns.corporation.setAutoJobAssignment(division, city, jobs[0], Math.max(Math.floor(ns.corporation.getOffice(division, city).numEmployees / 20), 1));
        ns.corporation.setAutoJobAssignment(division, city, jobs[1], Math.max(Math.floor(ns.corporation.getOffice(division, city).numEmployees / 20), 1));
        ns.corporation.setAutoJobAssignment(division, city, jobs[2], Math.max(Math.floor(ns.corporation.getOffice(division, city).numEmployees / 20), 1));
        ns.corporation.setAutoJobAssignment(division, city, jobs[3], Math.max(Math.floor(ns.corporation.getOffice(division, city).numEmployees / 20), 1));
        ns.corporation.setAutoJobAssignment(division, city, jobs[4], (ns.corporation.getOffice(division, city).numEmployees - (ns.corporation.getOffice(division, city).numEmployees / 4)));
      }
    }
    else {
      for (const city of cities) {
        ns.corporation.setAutoJobAssignment(division, city, jobs[5], 0);
        ns.corporation.setAutoJobAssignment(division, city, jobs[0], Math.floor(ns.corporation.getOffice(division, city).numEmployees / 5));
        ns.corporation.setAutoJobAssignment(division, city, jobs[1], Math.floor(1.5 * ns.corporation.getOffice(division, city).numEmployees / 5));
        ns.corporation.setAutoJobAssignment(division, city, jobs[2], Math.floor(0.5 * ns.corporation.getOffice(division, city).numEmployees / 5));
        ns.corporation.setAutoJobAssignment(division, city, jobs[3], Math.ceil(ns.corporation.getOffice(division, city).numEmployees / 5));
        ns.corporation.setAutoJobAssignment(division, city, jobs[4], Math.floor(ns.corporation.getOffice(division, city).numEmployees / 5));
      }
    }
  }
}

//function to spend research points
/** @param {NS} ns */
export function rAndD(ns) {
  //write an array of strings of research names
  //get research 10k upgrade as soon as we have 12k research points
  //get market T.A. II (70k for I and II) when we have 140k research points
  //get all the other researches as we have a reserve of 100k research points
  ns.corporation.research
}

//function to set prices
/** @param {NS} ns */
export function setPrices(ns) {
//remember to use market T.A. II for setting prices when it's available.
}

//function to create tobacco products continuously
/** @param {NS} ns */
export function tobaccoProdGo(ns) {
  const tobaccoDiv = "CamelCorp";
  let version = 1;
  const prodName = "Tobacco v";
  let products = ns.corporation.getDivision.products;
  if (products.length >= 3 && ns.corporation.getProduct(tobaccoDiv, "Aevum", products[2]).developmentProgress < 100) { return; }
  if (products.length >= 3 && ns.corporation.getProduct(tobaccoDiv, "Aevum", product[2]).developmentProgress >= 100) { ns.corporation.discontinueProduct(tobaccoDiv, products[0]); }
  ns.corporation.makeProduct(tobaccoDiv, "Aevum", prodName + version, Math.abs(ns.corporation.getCorporation().funds * 0.01), Math.abs(ns.corporation.getCorporation().funds * 0.01));
  version++;
}

//function to purchase corp-wide upgrades.
/** @param {NS} ns */
export function buyUpgrades(ns) {
  const upgradeFunds = ns.corporation.getCorporation().funds * 0.2;
  const lvlUps = ["Smart Factories", "Smart Storage", "FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants", "Wilson Analytics", "Project Insight"];
  const wilsonCost = ns.corporation.getUpgradeLevelCost(lvlUps[6]);
  const labCost = ns.corporation.getUpgradeLevelCost(lvlUps[7]);
  while (ns.corporation.getUpgradeLevel(lvlUps[0]) != ns.corporation.getUpgradeLevel(lvlUps[1])) {
    if (ns.corporation.getUpgradeLevel(lvlUps[0]) < ns.corporation.getUpgradeLevel(lvlUps[1])) {
      ns.corporation.levelUpgrade(lvlUps[0]);
    }
    else {
      ns.corporation.levelUpgrade(lvlUps[1]);
    }
  }
  const factCost = ns.corporation.getUpgradeLevelCost(lvlUps[0]) + ns.corporation.getUpgradeLevelCost(lvlUps[1]);
  const augLevels = []
  for (let i = 2; i < 5; i++) {
    augLevels.push(ns.corporation.getUpgradeLevel(lvlUps[i]));
  }
  while (!augLevels.reduce((a, x) => a == x)) {
    while (ns.corporation.getUpgradeLevel(lvlUps[2]) < ns.corporation.getUpgradeLevel(lvlUps[3]) || ns.corporation.getUpgradeLevel(lvlUps[2]) < ns.corporation.getUpgradeLevel(lvlUps[4]) || ns.corporation.getUpgradeLevel(lvlUps[2]) < ns.corporation.getUpgradeLevel(lvlUps[5])) {
      ns.corporation.levelUpgrade(lvlUps[2]);
    }
    while (ns.corporation.getUpgradeLevel(lvlUps[2]) > ns.corporation.getUpgradeLevel(lvlUps[3])) {
      ns.corporation.levelUpgrade(lvlUps[3]);
    }
    while (ns.corporation.getUpgradeLevel(lvlUps[2]) > ns.corporation.getUpgradeLevel(lvlUps[4])) {
      ns.corporation.levelUpgrade(lvlUps[4]);
    }
    while (ns.corporation.getUpgradeLevel(lvlUps[2]) > ns.corporation.getUpgradeLevel(lvlUps[5])) {
      ns.corporation.levelUpgrade(lvlUps[5]);
    }
    augLevels = [];
    for (let i = 2; i < 5; i++) {
      augLevels.push(ns.corporation.getUpgradeLevel(lvlUps[i]));
    }
  }
  const employeeUpCost = ns.corporation.getUpgradeLevelCost(lvlUps[2]) + ns.corporation.getUpgradeLevelCost(lvlUps[3]) + ns.corporation.getUpgradeLevelCost(lvlUps[4]) + ns.corporation.getUpgradeLevelCost(lvlUps[5]);
  if (upgradeFunds * 4 > wilsonCost) { ns.corporation.levelUpgrade(lvlUps[6]); return; }
  if (upgradeFunds < employeeUpCost) { return; }
  if (employeeUpCost / 2 > labCost) { ns.corporation.levelUpgrade(lvlUps[7]); return; }
  if (employeeUpCost > factCost) { ns.corporation.levelUpgrade(lvlUps[0]); ns.corporation.levelUpgrade(lvlUps[1]); return; }
  for (let i = 2; i < 5; i++) {
    ns.corporation.levelUpgrade(lvlUps[i]);
  }
}

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.tail();

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
  }


}
