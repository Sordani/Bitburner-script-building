/** @param {NS} ns */
export function getDivisions(ns) {
  return ns.corporation.getCorporation().divisions
}

/** @param {NS} ns */
export function employeeSatisfactionCheck(ns) {
  ns.clearLog();
  const avgs = [0, 0];
  for (const division of ns.corporation.getCorporation().divisions) {
    ns.print("   " + division);
    ns.print("");
    for (const city of ns.corporation.getDivision(division).cities) {
      avgs[0] += ns.corporation.getOffice(division, city).avgMorale;
      avgs[1] += ns.corporation.getOffice(division, city).avgEnergy;
    }
    ns.print("   avg morale: " + (avgs[0] / 6).toFixed(3) + "/98");
    ns.print("   avg energy: " + (avgs[1] / 6).toFixed(3) + "/98");
  }
}

/** @param {NS} ns */
export function teaParty(ns) {
  const divisions = ns.corporation.getCorporation().divisions;
  for (const division of divisions) {
    for (const city of ns.corporation.getDivision(division).cities) {
      const office = ns.corporation.getOffice(division, city);
      if (office.avgEnergy < 98) { ns.corporation.buyTea(division, city); }
      if (office.avgMorale < 98) { ns.corporation.throwParty(division, city, 500_000); }
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
      await ns.sleep(0);
    }

    while (ns.corporation.getCorporation().state == "START") {
      //same as above
      await ns.sleep(0);
    }
    //and to this part put things you want done exactly once per cycle
    teaParty(ns);
    employeeSatisfactionCheck(ns);

  }
}
