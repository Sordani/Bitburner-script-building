/** @param {NS} ns */
// Solve for number of growth threads required to get from money_lo to money_hi
// base is ns.formulas.hacking.growPercent(serverObject, 1, playerObject, cores)
function solveGrow(base, money_lo, money_hi) {
    if (money_lo >= money_hi) { return 0; }

    let threads = 1000;
    let prev = threads;
    for (let i = 0; i < 30; ++i) {
        let factor = money_hi / Math.min(money_lo + threads, money_hi - 1);
        threads = Math.log(factor) / Math.log(base);
        if (Math.ceil(threads) == Math.ceil(prev)) { break; }
        prev = threads;
    }

    return Math.ceil(Math.max(threads, prev, 0));
}

/** @param {NS} ns */
function is_prepped(ns, host) {
    return ns.getServerSecurityLevel(host) <= ns.getServerMinSecurityLevel(host) && ns.getServerMoneyAvailable(host) >= ns.getServerMaxMoney(host);
}

/** @param {NS} ns */
//function loop checks if each program that open ports exists.
function countPrograms(ns) {
    const fileArray = ["brutessh.exe", "ftpcrack.exe", "relaysmtp.exe", "httpworm.exe", "sqlinject.exe"];
    let fileCount = 0;
    for (let i = 0; i < fileArray.length;) {
        fileCount += ns.fileExists(fileArray[i], 'home');
        i++;
    }
    return fileCount;
}

/** @param {NS} ns */
// copied this straight from #early-game pinned messages in the bitburner discord. posted by xsinx#1018
// Returns a weight that can be used to sort servers by hack desirability
function Weight(ns, server) {
    if (!server) return 0;
    if (server.startsWith('hacknet-node')) return 0;
    let player = ns.getPlayer();
    let so = ns.getServer(server);
    so.hackDifficulty = so.minDifficulty;
    if (so.requiredHackingSkill > ns.getHackingLevel()) { return 0; }
    if (ns.getServerNumPortsRequired(server) > countPrograms(ns)) { return 0; }
    let weight = so.moneyMax / so.minDifficulty;
    if (ns.fileExists('Formulas.exe')) {
        weight = so.moneyMax / ns.formulas.hacking.weakenTime(so, player) * ns.formulas.hacking.hackChance(so, player);
    }
    else
        if (so.requiredHackingSkill > ns.getHackingLevel())
            return 0;
    return weight;
}

/** @param {NS} ns */
function updateTarget(ns) { //function to grab list of servers and assign hackability weight to them. requires Weight function.
    return getServerList(ns).map((server) => ({ name: server, score: Weight(ns, server) }))
}

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();

    const target = ns.args[0];
    const player = ns.getPlayer();
    const server = ns.getServer(target);
    const greed = 0.02; //2% to start and learn
    const hackSet = server.moneyMax * greed;

    ns.print(server);
    if (!is_prepped(ns, server.hostname)) {
        ns.print('Target not prepped (not at minSecurity or MaxMoney). you included code here to stop instead of doing anything about it.');
        ns.exit();
    }

    while (true) {
        const hackThreadcount = ns.fileExists('formulas.exe') ? ns.formulas.hacking.hackPercent(server.hostname, player, greed) : Math.floor(ns.hackAnalyzeThreads(target, hackSet));
        server.moneyAvailable = server.moneyMax * (1 - greed);
        const growThreadcount = ns.fileExists('formulas.exe') ? ns.formulas.hacking.growThreads(server.hostname, player, server.moneyMax) : Math.ceil(ns.growthAnalyze(server.hostname, (server.moneyMax / server.moneyAvailable)) + 0.001);
        const weakThreadcount = Math.ceil((hackThreadcount * 0.002) + (growThreadcount * 0.004) / 0.05);
        let wkTime = ns.getWeakenTime(server.hostname);
        let hkTime = ns.getHackTime(server.hostname);
        let gwTime = ns.getGrowTime(server.hostname);
        let hackPID = ns.exec("hack.js", "home", hackThreadcount, target);
        ns.print(hackPID);
        if (hackPID == 0) {
            break;
        }

        let growPID = ns.exec("grow.js", "home", growThreadcount, target);
        ns.print(growPID);
        if (growPID == 0) {
            break;
        }

        let weakPID = ns.exec("weak.js", "home", weakThreadcount + 10, target);
        ns.print(weakPID);
        if (weakPID == 0) {
            break;
        }
        const duration = wkTime + 100;
        const expectedEnd = performance.now() + duration;
        let timeRemaining = expectedEnd - performance.now();
        while (timeRemaining > 0) {
            timeRemaining = expectedEnd - performance.now();
            ns.clearLog();
            ns.print('hackPID: ' + hackPID);
            ns.print('hack thread count: ' + hackThreadcount);
            ns.print('hackTime: ' + ns.tFormat(hkTime));
            ns.print('growPID: ' + growPID);
            ns.print('grow thread count: ' + growThreadcount);
            ns.print('growTime: ' + ns.tFormat(gwTime));
            ns.print('weakPID: ' + weakPID);
            ns.print('weaken thread count: ' + weakThreadcount);
            ns.print('weakTime: ' + ns.tFormat(wkTime));
            ns.print('duration: ' + ns.tFormat(duration));
            ns.print('timeRemaining: ' + ns.tFormat(timeRemaining));
            await ns.sleep(100);
        }

        ns.print('Countdown Complete.');
    }
} //make sure grow.js, weak.js, and hack.js exist
