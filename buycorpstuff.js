//function to buy division-specific purchases
/** @param {NS} ns */
export async function divisPurchases(ns) {
  const prodCity = "Aevum";
  const supportCities = ["Sector-12", "Chongqing", "New Tokyo", "Ishima", "Volhaven"]
  const divisions = ns.corporation.getCorporation().divisions
  let funds = ns.corporation.getCorporation().funds * 0.75;
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
      let y = Math.max(ns.corporation.getOfficeSizeUpgradeCost(division, prodCity, 15), ns.corporation.getOfficeSizeUpgradeCost(division, supportCities[0], 15), ns.corporation.getOfficeSizeUpgradeCost(division, supportCities[1], 15), ns.corporation.getOfficeSizeUpgradeCost(division, supportCities[2], 15), ns.corporation.getOfficeSizeUpgradeCost(division, supportCities[3], 15), ns.corporation.getOfficeSizeUpgradeCost(division, supportCities[4], 15));
      if (!supportExps.every((number) => number === supportExps[0])) {
        ns.print("found inbalance in supportExps for " + division + ". Correcting. goal is " + y);
        while (!supportExps.every((number) => number === supportExps[0])) {
          if (funds < supportExpCost) { ns.print("not enough funds to correct. awaiting funds"); return; }
          for (city of supportCities) {
            while (ns.corporation.getOffice(division, city).numEmployees < y) {
              ns.corporation.upgradeOfficeSize(division, city, 3);
              while (ns.corporation.hireEmployee(division, city)) { await ns.sleep(0); }
              await ns.sleep(0);
            }
          }
          y = Math.max(ns.corporation.getOfficeSizeUpgradeCost(division, prodCity, 15), ns.corporation.getOfficeSizeUpgradeCost(division, supportCities[0], 15), ns.corporation.getOfficeSizeUpgradeCost(division, supportCities[1], 15), ns.corporation.getOfficeSizeUpgradeCost(division, supportCities[2], 15), ns.corporation.getOfficeSizeUpgradeCost(division, supportCities[3], 15), ns.corporation.getOfficeSizeUpgradeCost(division, supportCities[4], 15));
          await ns.sleep(0);
        }
      }
      while (ns.corporation.getOffice(division, prodCity).size < ns.corporation.getOffice(division, supportCities[0]).size + 30) {
        ns.print(prodCity + " is not 30 employees ahead of the other cities. correcting. goal is " + (ns.corporation.getOffice(division, supportCities[0]) + 30));
        ns.corporation.upgradeOfficeSize(division, prodCity, 3);
        while (ns.corporation.hireEmployee(division, prodCity)) { await ns.sleep(0); }
        await ns.sleep(0);
      }
      let z = Math.max(ns.corporation.getWarehouse(division, prodCity).level, ns.corporation.getWarehouse(division, supportCities[0]).level, ns.corporation.getWarehouse(division, supportCities[1]).level, ns.corporation.getWarehouse(division, supportCities[2]).level, ns.corporation.getWarehouse(division, supportCities[3]).level, ns.corporation.getWarehouse(division, supportCities[4]).level);
      while (!supportWHs.every((number) => number === supportWHs[0])) {
        ns.print("found inbalance in supportWHs. correcting");
        ns.print("supportWHs: " + supportWHs);
        if (funds < supportWHCost) { return; }
        for (const city of supportCities) {
          while (ns.corporation.getWarehouse(division, city).level < z) {
            ns.corporation.upgradeWarehouse(division, city);
            ns.print("upgrading " + city + " warehouse in " + division);
            await ns.sleep(0);
          }
        }
        funds = ns.corporation.getCorporation().funds * 0.75;
        await ns.sleep(0);
      }
      if ((funds * 0.8) / divisions.length >= advertCost || (funds * 0.8) / divisions.length >= officeExpCost) {
        if (officeExpCost > advertCost) { ns.corporation.hireAdVert(division); ns.print("AdVert bought in " + division); }
        if (officeExpCost < advertCost) {
          if (officeExpCost < supportExpCost) {
            ns.corporation.upgradeOfficeSize(division, prodCity, 15);
            while (ns.corporation.hireEmployee(division, prodCity)) { await ns.sleep(0); }
            ns.print("upgraded " + prodCity + " Office capacity in " + division + " (prodCity)");
          }
          else {
            for (const city of supportCities) {
              ns.corporation.upgradeOfficeSize(division, city, 15);
              while (ns.corporation.hireEmployee(division, city)) { }
              ns.print("upgraded " + city + " office capacity in " + division);
            }
          }
        }
        await ns.sleep(0);
      }
      while ((funds * 0.01) / divisions.length >= ns.corporation.getUpgradeWarehouseCost(division, supportCities[0]) * 6) {
        ns.print("upgrading warehouses in " + division);
        ns.corporation.upgradeWarehouse(division, prodCity);
        for (const city of supportCities) {
          ns.corporation.upgradeWarehouse(division, city);
        }
        await ns.sleep(0);
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
      let y = Math.max(ns.corporation.getOffice(division, cities[0]).size, ns.corporation.getOffice(division, cities[1]).size, ns.corporation.getOffice(division, cities[2]).size, ns.corporation.getOffice(division, cities[3]).size, ns.corporation.getOffice(division, cities[4]).size, ns.corporation.getOffice(division, cities[5]).size);
      while (!officeExps.every((number) => number === officeExps[0])) {
        ns.print("found inbalance in officeExps for " + division + ". Correcting");
        ns.print("officeExps: " + officeExps);
        if (funds < officeExpCost) { ns.print("not enough funds to correct. awaiting income."); return; }
        for (const city of cities) {
          while (ns.corporation.getOffice(division, city).numEmployees < y) {
            ns.corporation.upgradeOfficeSize(division, city, 3);
            while (ns.corporation.hireEmployee(division, city)) { await ns.sleep(0); }
            await ns.sleep(0);
          }
        }
        officeExps = [];
        for (const city of cities) {
          officeExps.push(ns.corporation.getOfficeSizeUpgradeCost(division, city, 15));
        }
        officeExpCost = 0;
        for (let i = 0; i < officeExps.length; i++) {
          officeExpCost += officeExps[i];
        }
        y = Math.max(ns.corporation.getOffice(division, cities[0]).size, ns.corporation.getOffice(division, cities[1]).size, ns.corporation.getOffice(division, cities[2]).size, ns.corporation.getOffice(division, cities[3]).size, ns.corporation.getOffice(division, cities[4]).size, ns.corporation.getOffice(division, cities[5]).size);
        funds = ns.corporation.getCorporation().funds * 0.75;
        await ns.sleep(0);
      }
      let z = ns.corporation.getWarehouse(division, cities[0]).level;
      while (!warehouseUps.every((number) => number === warehouseUps[0])) {
        ns.print("found inbalance in warehouseUps for " + division + ". Correcting");
        ns.print("warehouseUps: " + warehouseUps);
        if (funds < warehouseUps) { ns.print("not enough funds to correct. awaiting income."); return; }
        for (city of cities) {
          while (ns.corporation.getWarehouse(division, city).level < z) {
            ns.corporation.upgradeWarehouse(division, city);
            await ns.sleep(0);
          }
        }
        warehouseUps = [];
        for (const city of cities) {
          warehouseUps.push(ns.corporation.getUpgradeWarehouseCost(division, city));
        }
        warehouseCost = 0;
        for (let i = 0; i < warehouseUps.length; i++) {
          warehouseCost += warehouseUps[i];
        }
        funds = ns.corporation.getCorporation().funds * 0.75;
        await ns.sleep(0);
      }
      if ((funds * 0.8) / (divisions.length) >= officeExpCost) {
        ns.print("upgrading Office Sizes for all cities in " + division);
        for (const city of cities) {
          ns.corporation.upgradeOfficeSize(division, city, 15);
          while (ns.corporation.hireEmployee(division, city)) { await ns.sleep(0); }
        }
        funds = ns.corporation.getCorporation().funds * 0.75;
        await ns.sleep(0);
      }
      if ((funds * 0.01) / (divisions.length) >= warehouseCost) {
        ns.print("upgrading warehouses for all cities in " + division);
        for (const city of cities) {
          ns.corporation.upgradeWarehouse(division, city);
        }
        funds = ns.corporation.getCorporation().funds * 0.75;
        await ns.sleep(0);
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
        ns.corporation.setAutoJobAssignment(division, city, jobs[4], (ns.corporation.getOffice(division, city).numEmployees - (ns.corporation.getOffice(division, city).numEmployees / 5)));
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
  const rdNames = ["Hi-Tech R&D Laboratory", "Market-TA.I", "Market-TA.II", "Automatic Drug Administration", "Go-Juice", "Overclock", "Sti.mu", "CPH4 Injections", "Drones", "Drones - Assembly", "Drones - Transport", "Self-Correcting Assemblers", "AutoBrew", "AutoPartyManager", "uPgrade: Fulcrum", "uPgrade: Capacity.I", "uPgrade:Dashboard"];
  const prodrdNames = ["uPgrade: Fulcrum", "uPgrade: Capacity.I", "uPgrade: Dashboard"];
  for (const division of ns.corporation.getCorporation().divisions) {
    if (ns.corporation.getDivision(division).researchPoints > 12000 && !ns.corporation.hasResearched(division, rdNames[0])) { ns.print("purchasing research: " + rdNames[0] + " in " + division); ns.corporation.research(division, rdNames[0]); }
    if (!ns.corporation.hasResearched(division, rdNames[0])) { return; }
    if (ns.corporation.getDivision(division).researchPoints > 140000 && !ns.corporation.hasResearched(division, rdNames[2])) { ns.print("purchasing research: " + rdNames[2] + " in " + division); ns.corporation.research(division, rdNames[1]); ns.corporation.research(division, rdNames[2]); } else { return; }
    if (!ns.corporation.hasResearched(division, rdNames[2])) { return; }
    if (ns.corporation.getDivision(division).researchPoints > 150000 && !ns.corporation.hasResearched(division, rdNames[4])) { ns.print("purchasing research: " + rdNames[4] + " in " + division); ns.corporation.research(division, rdNames[3]); ns.corporation.research(division, rdNames[4]); }
    if (!ns.corporation.hasResearched(division, rdNames[4])) { return; }
    if (ns.corporation.getDivision(division).researchPoints > 150000 && !ns.corporation.hasResearched(division, rdNames[6])) { ns.print("purchasing research: " + rdNames[6] + " in " + division); ns.corporation.research(division, rdNames[5]); ns.corporation.research(division, rdNames[6]); }
    if (!ns.corporation.hasResearched(division, rdNames[6])) { return; }
    if (ns.corporation.getDivision(division).researchPoints > 100000 && !ns.corporation.hasResearched(division, rdNames[7])) { ns.print("purchasing research: " + rdNames[7] + " in " + division); ns.corporation.research(division, rdNames[7]); }
    for (const name of rdNames) {
      if (ns.corporation.getDivision(division).researchPoints * 30 >= ns.corporation.getResearchCost(division, name) && !ns.corporation.hasResearched(division, name)) { ns.print("purchasing research: " + name + " in " + division); ns.corporation.research(division, name); }
    }
    if (ns.corporation.getDivision(division).makesProducts && ns.corporation.getDivision(division).researchPoints * 10 >= (ns.corporation.getResearchCost(prodrdNames[0]) * 3.5)) {
      for (const name of prodrdNames) { ns.print("purchasing research: " + name + " in " + division); ns.corporation.research(division, name); }
    }
  }
}

//function to set prices
/** @param {NS} ns */
export function setPrices(ns) {
  const cities = ["Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven", "Sector-12"];
  const mats = ["Water", "Food", "Plants", "Hardware", "Chemicals", "Drugs", "Ore", "Metal"];
  for (const division of ns.corporation.getCorporation().divisions) {
    for (const city of cities) {
      if (ns.corporation.getDivision(division).makesProducts) {
        const prods = ns.corporation.getDivision(division).products
        for (const prod of prods) {
          let prodData = ns.corporation.getProduct(division, city, prod);
          if (prodData.developmentProgress < 100 && !ns.corporation.hasResearched(division, "uPgrade: Dashboard")) { continue; }
          if (ns.corporation.hasResearched(division, "Market-TA.II")) {
            ns.corporation.sellProduct(division, city, prod, "MAX", "MP", true);
            ns.corporation.setProductMarketTA2(division, prod, true);
          } else {
            let x = 1;
            if (!prodData.desiredSellPrice == 0 && (prodData.actualSellAmount < prodData.productionAmount || prodData.stored > 0)) { x = prodData.desiredSellPrice.at(-1) - 0.001 }
            if (!prodData.desiredSellPrice == 0 && prodData.actualSellAmount >= prodData.productionAmount && prodData.stored == 0) { x = prodData.desiredSellPrice.at(-1) + 0.001 }
            ns.corporation.sellProduct(division, city, prod, "MAX", "MP*" + x, true);
          }
        }
      }
      for (const mat of mats) {
        const matData = ns.corporation.getMaterial(division, city, mat)
        if (matData.productionAmount <= 0) {
          ns.corporation.sellMaterial(division, city, mat, 0, 0);
          continue;
        }
        if (ns.corporation.hasResearched(division, "Market-TA.II")) {
          ns.corporation.sellMaterial(division, city, mat, "MAX", "MP");
          ns.corporation.setMaterialMarketTA2(division, city, mat, true);
        } else {
          let x = 1;
          if (!matData.desiredSellPrice == 0 && (matData.actualSellAmount < matData.productionAmount || matData.stored > 0)) { x = matData.desiredSellPrice.at(-1) - 0.001 }
          if (!matData.desiredSellPrice == 0 && matData.actualSellAmount >= matData.productionAmount && matData.stored == 0) { x = matData.desiredSellPrice.at(-1) + 0.001 }
          ns.corporation.sellMaterial(division, city, mat, "MAX", "MP*" + x);
        }
      }
    }
  }
}

//function to manage exports
/** @param {NS} ns */
export function marketPlace(ns) {
  const cities = ["Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven", "Sector-12"];
  const divNames = ["AgriCorp", "CamelCorp", "AquaCorp", "ChemCorp", "GoronCorp", "ForgeCorp", "MicroCorp", "SkyNetCorp", "RobotnicCorp", "ZoraCorp", "PharmaCorp", "HeartCorp", "CoiCorp", "DelTacoCorp"];
  for (const city of cities) {
    if (ns.corporation.getCorporation().divisions.includes(divNames[1])) {
      ns.corporation.exportMaterial(divNames[0], city, divNames[1], city, "Plants", "IPROD*(-1)");
    }
    if (ns.corporation.getCorporation().divisions.includes(divNames[2])) {
      ns.corporation.exportMaterial(divNames[2], city, divNames[0], city, "Water", "IPROD*(-1)");
    }
    if (ns.corporation.getCorporation().divisions.includes(divNames[3])) {
      ns.corporation.exportMaterial(divNames[0], city, divNames[3], city, "Plants", "IPROD*(-1)");
      ns.corporation.exportMaterial(divNames[3], city, divNames[0], city, "Chemicals", "IPROD*(-1)");
      ns.corporation.exportMaterial(divNames[2], city, divNames[3], city, "Water", "IPROD*(-1)");
    }
    if (ns.corporation.getCorporation().divisions.includes(divNames[5])) {
      ns.corporation.exportMaterial(divNames[4], city, divNames[5], city, "Ore", "IPROD*(-1)");
    }
    if (ns.corporation.getCorporation().divisions.includes(divNames[6])) {
      ns.corporation.exportMaterial(divNames[5], city, divNames[6], city, "Metal", "IPROD*(-1)");
      for (let i = 0; i < ns.corporation.getCorporation().divisions.length; i++) {
        switch (divNames[i]) {
          case divNames[6]:
            break;
          case divNames[7]:
          case divNames[8]:
          case divNames[9]:
            ns.corporation.exportMaterial(divNames[6], city, divNames[i], city, "Hardware", "IPROD*(-1)");
            break;
          default:
            ns.corporation.exportMaterial(divNames[6], city, divNames[i], city, "Hardware", "EPROD/" + ((divNames.length * cities.length) * 10));
            break;
        }
      }
    }
    if (ns.corporation.getCorporation().divisions.includes(divNames[7])) {
      ns.corporation.exportMaterial(divNames[7], city, divNames[8], city, "AI Cores", "IPROD*(-1)");
      for (let i = 0; i < ns.corporation.getCorporation().divisions.length; i++) {
        switch (divNames[i]) {
          case divNames[7]:
            break;
          case divNames[8]:
          case divNames[11]:
            ns.corporation.exportMaterial(divNames[6], city, divNames[i], city, "AI Cores", "IPROD*(-1)");
            break;
          default:
            ns.corporation.exportMaterial(divNames[6], city, divNames[i], city, "AI Cores", "EPROD/" + ((divNames.length * cities.length) * 5));
            break;
        }
      }
    }
    if (ns.corporation.getCorporation().divisions.includes(divNames[8])) {
      ns.corporation.exportMaterial(divNames[7], city, divNames[8], city, "AI Cores", "IPROD*(-1)");
      for (let i = 0; i < ns.corporation.getCorporation().divisions.length; i++) {
        switch (divNames[i]) {
          case divNames[8]:
            break;
          case divNames[11]:
            ns.corporation.exportMaterial(divNames[6], city, divNames[i], city, "Robots", "IPROD*(-1)");
            break;
          default:
            ns.corporation.exportMaterial(divNames[6], city, divNames[i], city, "Robots", "EPROD/" + ((divNames.length * cities.length) * 10));
            break;
        }
      }
    }
    if (ns.corporation.getCorporation().divisions.includes(divNames[9])) {
      ns.corporation.exportMaterial(divNames[9], city, divNames[0], city, "Water", "IPROD*(-1)");
    }
    if (ns.corporation.getCorporation().divisions.includes(divNames[10])) {
      ns.corporation.exportMaterial(divNames[3], city, divNames[10], city, "Chemicals", "IPROD*(-1)");
      ns.corporation.exportMaterial(divNames[2], city, divNames[10], city, "Water", "IPROD*(-1)");
      ns.corporation.exportMaterial(divNames[9], city, divNames[10], city, "Water", "IPROD*(-1)");
    }
    if (ns.corporation.getCorporation().divisions.includes(divNames[11])) {
      ns.corporation.exportMaterial(divNames[0], city, divNames[11], city, "Food", "IPROD*(-1)");
      ns.corporation.exportMaterial(divNames[10], city, divNames[11], city, "Drugs", "IPROD*(-1)");
    }
    if (ns.corporation.getCorporation().divisions.includes(divNames[12])) {
      ns.corporation.exportMaterial(divNames[0], city, divNames[12], city, "Plants", "IPROD*(-1)");
      ns.corporation.exportMaterial(divNames[12], city, divNames[11], city, "Food", "IPROD*(-1)");
    }
  }
}

//function to create tobacco products continuously
/** @param {NS} ns */
export function makeProd(ns) {
  const divNames = ["CamelCorp", "MicroCorp", "SkyNetCorp", "RobotnicCorp", "PharmaCorp", "HeartCorp", "DelTacoCorp"];
  const prodNames = ["Tobacco v", "Asus v", "Jarvis v", "Chappy v", "CureAll v", "Kaiser #", "DelTaco #"];
  for (let i = 0; i < divNames.length; i++) {
    const prodMax = ns.corporation.hasResearched(divNames[i], "uPgrade: Capacity.I") ? 4 : 3;
    let products = ns.corporation.getDivision(divNames[i]).products;
    let version = (ns.corporation.getDivision(divNames[i]).products.length > 0) ? parseInt(products.at(-1).at(-1)) + 1 : 1;
    if (products.length >= prodMax && ns.corporation.getProduct(divNames[i], "Aevum", products[prodMax - 1]).developmentProgress < 100) { return; }
    if (products.length >= prodMax && ns.corporation.getProduct(divNames[i], "Aevum", products[prodMax - 1]).developmentProgress >= 100) { ns.corporation.discontinueProduct(divNames[i], products[0]); }
    ns.corporation.makeProduct(divNames[i], "Aevum", (prodNames[i] + version), Math.abs(ns.corporation.getCorporation().funds * 0.01), Math.abs(ns.corporation.getCorporation().funds * 0.01));
    ns.print("started new product in " + divNames[i] + ", product: " + (prodNames[i] + version) + " - funding: " + ns.formatNumber((Math.abs(ns.corporation.getCorporation().funds * 0.01) * 2), 3));
  }
}

//function to purchase corp-wide upgrades.
/** @param {NS} ns */
export async function corpPurchases(ns) {
  const upgradeFunds = ns.corporation.getCorporation().funds * 0.2;
  const lvlUps = [
    "Smart Factories",
    "Smart Storage",
    "DreamSense",
    "Wilson Analytics",
    "Nuoptimal Nootropic Injector Implants",
    "Speech Processor Implants",
    "Neural Accelerators",
    "FocusWires",
    "ABC SalesBots",
    "Project Insight"
  ];
  const wilsonCost = ns.corporation.getUpgradeLevelCost(lvlUps[3]);
  const labCost = ns.corporation.getUpgradeLevelCost(lvlUps[9]);
  const abcCost = ns.corporation.getUpgradeLevelCost(lvlUps[8]);
  while (ns.corporation.getUpgradeLevel(lvlUps[0]) != ns.corporation.getUpgradeLevel(lvlUps[1])) {
    if (ns.corporation.getUpgradeLevel(lvlUps[0]) < ns.corporation.getUpgradeLevel(lvlUps[1])) {
      ns.corporation.levelUpgrade(lvlUps[0]);
    }
    else {
      ns.corporation.levelUpgrade(lvlUps[1]);
    }
    await ns.sleep(0);
  }
  const factCost = ns.corporation.getUpgradeLevelCost(lvlUps[0]) + ns.corporation.getUpgradeLevelCost(lvlUps[1]);
  let augLevels = [];
  for (let i = 4; i < 8; i++) {
    augLevels.push(ns.corporation.getUpgradeLevel(lvlUps[i]));
  }
  while (!augLevels.every((number) => number === augLevels[0])) {
    ns.print("employee augment upgrades imbalanced. correcting");
    ns.print("augLevels: " + augLevels);
    await ns.sleep(0);
    while (ns.corporation.getUpgradeLevel(lvlUps[4]) < ns.corporation.getUpgradeLevel(lvlUps[5]) || ns.corporation.getUpgradeLevel(lvlUps[4]) < ns.corporation.getUpgradeLevel(lvlUps[6]) || ns.corporation.getUpgradeLevel(lvlUps[4]) < ns.corporation.getUpgradeLevel(lvlUps[7])) {
      ns.corporation.levelUpgrade(lvlUps[4]);
      await ns.sleep(0);
    }
    while (ns.corporation.getUpgradeLevel(lvlUps[4]) > ns.corporation.getUpgradeLevel(lvlUps[5])) {
      ns.corporation.levelUpgrade(lvlUps[5]);
      await ns.sleep(0);
    }
    while (ns.corporation.getUpgradeLevel(lvlUps[4]) > ns.corporation.getUpgradeLevel(lvlUps[6])) {
      ns.corporation.levelUpgrade(lvlUps[6]);
      await ns.sleep(0);
    }
    while (ns.corporation.getUpgradeLevel(lvlUps[4]) > ns.corporation.getUpgradeLevel(lvlUps[7])) {
      ns.corporation.levelUpgrade(lvlUps[7]);
      await ns.sleep(0);
    }
    augLevels = [];
    for (let i = 4; i < 8; i++) {
      augLevels.push(ns.corporation.getUpgradeLevel(lvlUps[i]));
    }
    await ns.sleep(0);
  }
  const employeeUpCost = ns.corporation.getUpgradeLevelCost(lvlUps[4]) + ns.corporation.getUpgradeLevelCost(lvlUps[5]) + ns.corporation.getUpgradeLevelCost(lvlUps[6]) + ns.corporation.getUpgradeLevelCost(lvlUps[7]);
  ns.print("employeeUpCost: " + ns.formatNumber(employeeUpCost, 3) + " // funds allowed: " + ns.formatNumber(upgradeFunds, 3));
  if (upgradeFunds * 2.5 > wilsonCost) { ns.print("buying " + lvlUps[3] + " upgrade"); ns.corporation.levelUpgrade(lvlUps[3]); return; }
  if (upgradeFunds < employeeUpCost) { return; }
  if (employeeUpCost / 2 > labCost) { ns.print("buying " + lvlUps[9] + " upgrade"); ns.corporation.levelUpgrade(lvlUps[9]); return; }
  if (employeeUpCost > factCost) { ns.print("buying " + lvlUps[0] + " and " + lvlUps[1] + "upgrades"); ns.corporation.levelUpgrade(lvlUps[0]); ns.corporation.levelUpgrade(lvlUps[1]); return; }
  ns.print("buying employee augment upgrades")
  for (let i = 4; i < 8; i++) {
    ns.corporation.levelUpgrade(lvlUps[i]);
  }
  if (upgradeFunds * 0.01 > abcCost) { ns.print("buying " + lvlUps[8] + " upgrade"); ns.corporation.levelUpgrade(lvlUps[8]); }
  if (upgradeFunds * 0.01 > ns.corporation.getUpgradeLevelCost(lvlUps[2])) { ns.print("buying " + lvlUps[2] + " upgrade"); ns.corporation.levelUpgrade(lvlUps[2]); }
}

//function to expand to other industries.
/** @param {NS} ns */
export function expansionPlan(ns) {
  const funds = ns.corporation.getCorporation().funds;
  const cities = ["Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven", "Sector-12"];
  const divisionNames = ["AgriCorp", "CamelCorp", "AquaCorp", "ChemCorp", "GoronCorp", "ForgeCorp", "MicroCorp", "SkyNetCorp", "RobotnicCorp", "ZoraCorp", "PharmaCorp", "HeartCorp", "CoiCorp", "DelTacoCorp"];
  const divisionTypes = ["Agriculture", "Tobacco", "Spring Water", "Chemical", "Mining", "Refinery", "Computer Hardware", "Software", "Robotics", "Water Utilities", "Pharmaceutical", "Healthcare", "Fishing", "Restaurant"];
  if (funds >= 6e11 && ns.corporation.getCorporation().divisions.includes(divisionNames[1])) {
    ns.corporation.expandIndustry(divisionTypes[2], divisionNames[2]);
    for (let i = 0; i < 5; i++) {
      ns.corporation.expandCity(divisionNames[2], cities[i]);
      ns.corporation.purchaseWarehouse(divisionNames[2], cities[i]);
    }
  }
  if (funds >= 7.5e11 & ns.corporation.getCorporation().divisions.includes(divisionNames[2])) {
    ns.corporation.expandIndustry(divisionTypes[3], divisionNames[3]);
    for (let i = 0; i < 5; i++) {
      ns.corporation.expandCity(divisionNames[2], cities[i]);
      ns.corporation.purchaseWarehouse(divisionNames[2], cities[i]);
    }
  }
  if (funds >= 1e14 && ns.corporation.getCorporation().divisions.includes(divisionNames[3])) {
    ns.corporation.expandIndustry(divisionTypes[4], divisionNames[4]);
    for (let i = 0; i < 5; i++) {
      ns.corporation.expandCity(divisionNames[4], cities[i]);
      ns.corporation.purchaseWarehouse(divisionNames[4], cities[i]);
    }
  }
  if (funds >= 1.5e14 && ns.corporation.getCorporation().divisions.includes(divisionNames[4])) {
    ns.corporation.expandIndustry(divisionTypes[5], divisionNames[5]);
    for (let i = 0; i < 5; i++) {
      ns.corporation.expandCity(divisionNames[5], cities[i]);
      ns.corporation.purchaseWarehouse(divisionNames[5], cities[i]);
    }
  }
  if (funds >= 5e14 && ns.corporation.getCorporation().divisions.includes(divisionNames[5])) {
    ns.corporation.expandIndustry(divisionTypes[6], divisionNames[6]);
    for (let i = 0; i < 5; i++) {
      ns.corporation.expandCity(divisionNames[6], cities[i]);
      ns.corporation.purchaseWarehouse(divisionNames[6], cities[i]);
    }
  }
  if (funds >= 7.5e14 && ns.corporation.getCorporation().divisions.includes(divisionNames[6])) {
    ns.corporation.expandIndustry(divisionTypes[7], divisionNames[7]);
    for (let i = 0; i < 5; i++) {
      ns.corporation.expandCity(divisionNames[7], cities[i]);
      ns.corporation.purchaseWarehouse(divisionNames[7], cities[i]);
    }
  }
  if (funds >= 5e15 && ns.corporation.getCorporation().divisions.includes(divisionNames[7])) {
    ns.corporation.expandIndustry(divisionTypes[8], divisionNames[8]);
    for (let i = 0; i < 5; i++) {
      ns.corporation.expandCity(divisionNames[8], cities[i]);
      ns.corporation.purchaseWarehouse(divisionNames[8], cities[i]);
    }
  }
  if (funds >= 2e16 && ns.corporation.getCorporation().divisions.includes(divisionNames[8])) {
    ns.corporation.expandIndustry(divisionTypes[9], divisionNames[9]);
    for (let i = 0; i < 5; i++) {
      ns.corporation.expandCity(divisionNames[9], cities[i]);
      ns.corporation.purchaseWarehouse(divisionNames[9], cities[i]);
    }
  }
  if (funds >= 5e16 && ns.corporation.getCorporation().divisions.includes(divisionNames[9])) {
    ns.corporation.expandIndustry(divisionTypes[10], divisionNames[10]);
    for (let i = 0; i < 5; i++) {
      ns.corporation.expandCity(divisionNames[10], cities[i]);
      ns.corporation.purchaseWarehouse(divisionNames[10], cities[i]);
    }
  }
  if (funds >= 7.5e16 && ns.corporation.getCorporation().divisions.includes(divisionNames[10])) {
    ns.corporation.expandIndustry(divisionTypes[11], divisionNames[11]);
    for (let i = 0; i < 5; i++) {
      ns.corporation.expandCity(divisionNames[11], cities[i]);
      ns.corporation.purchaseWarehouse(divisionNames[11], cities[i]);
    }
  }
  if (funds >= 1e17 && ns.corporation.getCorporation().divisions.includes(divisionNames[11])) {
    ns.corporation.expandIndustry(divisionTypes[12], divisionNames[12]);
    for (let i = 0; i < 5; i++) {
      ns.corporation.expandCity(divisionNames[12], cities[i]);
      ns.corporation.purchaseWarehouse(divisionNames[12], cities[i]);
    }
  }
  if (funds >= 2e17 && ns.corporation.getCorporation().divisions.includes(divisionNames[12])) {
    ns.corporation.expandIndustry(divisionTypes[13], divisionNames[13]);
    for (let i = 0; i < 5; i++) {
      ns.corporation.expandCity(divisionNames[13], cities[i]);
      ns.corporation.purchaseWarehouse(divisionNames[13], cities[i]);
    }
  }
}

//function to replicate smart supply and save money earlygame 
export function dumbSupply(ns) {
    if (ns.corporation.hasUnlock("Smart Supply")) { return; }
    const mats = ["Water", "Food", "Plants", "Chemicals", "Drugs", "Ore", "Metal"];
    const cities = ["Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven", "Sector-12"];
    for (const division of ns.corporation.getCorporation().divisions) {
      for (const city of cities) {
        if (ns.corporation.getDivision(division).type == "Agriculture") {
          const water = ns.corporation.getMaterial(division, city, mats[0]);
          const food = ns.corporation.getMaterial(division, city, mats[1]);
          const chemicals = ns.corporation.getMaterial(division, city, mats[3]);
          if (Math.max(food.productionAmount * 0.5, 500) * 0.5 < water.stored * 3) {
            ns.corporation.buyMaterial(division, city, mats[0], 0);
          } else { ns.corporation.buyMaterial(division, city, mats[0], Math.max(((food.productionAmount * 0.5) / 10), 500)); }
          if (Math.max(food.productionAmount * 0.2, 500) < chemicals.stored * 3) {
            ns.corporation.buyMaterial(division, city, mats[3], 0);
          } else { ns.corporation.buyMaterial(division, city, mats[3], Math.Max(((food.productionAmount * 0.2) / 10), 500)); }
        }
        if (ns.corporation.getDivision(division).type == "Tobacco") {
          const plants = ns.corporation.getMaterial(division, city, mats[2]);
          const products = ns.corporation.getDivision(tobaccoName).products;
          let prodProduction = 0;
          for (const product of products) {
            prodProduction += ns.corporation.getProduct(division, city, product).productionAmount;
          }
          if (Math.max(prodProduction, 1500) < plants.stored * 9) {
            ns.corporation.buyMaterial(division, city, mats[2], 0);
          } else { ns.corporation.buyMaterial(division, city, mats[2], Math.max(((food.productionAmount * 0.2) / 10), 1500)); }
        }
      }
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
      await corpPurchases(ns);
      await divisPurchases(ns);
      await ns.sleep(0);
    }

    while (ns.corporation.getCorporation().state == "START") {
      //same as above
      await ns.sleep(0);
    }
    //and to this part put things you want done exactly once per cycle
    setPrices(ns);
    makeProd(ns);
    rAndD(ns);
    humanResources(ns);
    marketPlace(ns);
    expansionPlan(ns);
    dumbSupply(ns);
  }


}
