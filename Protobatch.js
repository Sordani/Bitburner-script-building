/** @param {NS} ns */
function is_prepped(ns, host) {
    return ns.getServerSecurityLevel(host) <= ns.getServerMinSecurityLevel(host) && ns.getServerMoneyAvailable(host) >= ns.getServerMaxMoney(host);
}

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
        const hThreads = ns.fileExists('formulas.exe') ? ns.formulas.hacking.hackPercent(server, player, greed) : Math.floor(ns.hackAnalyzeThreads(target, hackSet));
        server.moneyAvailable = server.moneyMax * (1 - greed);
        const gThreads = ns.fileExists('formulas.exe') ? ns.formulas.hacking.growThreads(server, player, server.moneyMax) : Math.ceil(ns.growthAnalyze(server.hostname, (server.moneyMax / server.moneyAvailable)) + 0.001);
        const wThreads1 = Math.max(Math.ceil(hThreads * 0.002 / 0.05), 1);
        const wThreads2 = Math.max(Math.ceil(gThreads * 0.004 / 0.05), 1);
        let wkTime = ns.getWeakenTime(server.hostname);
        let hkTime = ns.getHackTime(server.hostname);
        let gwTime = ns.getGrowTime(server.hostname);
        const spacer = 30;
        let hkDelay = wkTime - spacer - hkTime;
        let wk1Delay = 0;
        let gwDelay = wkTime + spacer - gwTime;
        let wk2Delay = spacer * 2;
        let hackPID = ns.exec("hack.js", "home", hThreads, target, hkDelay);
        ns.print(hackPID);
        if (hackPID == 0) {
            break;
        }
        let weakPID1 = ns.exec("weak.js", "home", wThreads1, target, wk1Delay);
        ns.print(weakPID1);
        if (weakPID1 == 0) {
            break;
        }
        let growPID = ns.exec("grow.js", "home", gThreads, target, gwDelay);
        ns.print(growPID);
        if (growPID == 0) {
            break;
        }
        let weakPID2 = ns.exec("weak.js", "home", wThreads2, target, wk2Delay);
        ns.print(weakPID2);
        if (weakPID2 == 0) {
            break;
        }

        let expectedEndh = performance.now() + hkTime + hkDelay;
        let expectedStarth = performance.now() + hkDelay;
        let expectedEndw1 = performance.now() + wkTime + wk1Delay;
        let expectedEndg = performance.now() + gwTime + gwDelay;
        let expectedStartg = performance.now() + gwDelay;
        let expectedEndw2 = performance.now() + wkTime + wk2Delay;
        let timeRemainingh = expectedEndh - performance.now();
        let timeToStarth = expectedStarth - performance.now();
        let timeRemainingw1 = expectedEndw1 - performance.now();
        let timeRemainingg = expectedEndg - performance.now();
        let timeToStartg = expectedStartg - performance.now();
        let timeRemainingw2 = expectedEndw2 + wk2Delay - performance.now();
        while (timeRemainingw2 > 0) {
            timeRemainingh = expectedEndh - performance.now();
            timeRemainingw1 = expectedEndw1 - performance.now();
            timeRemainingg = expectedEndg - performance.now();
            timeRemainingw2 = expectedEndw2 + wk2Delay - performance.now();
            timeToStarth = expectedStarth - performance.now();
            timeToStartg = expectedStartg - performance.now();
            ns.clearLog();
            ns.print('  Item       :  Hack, 1st Weaken, Grow, 2nd Weaken')
            ns.print('HWGW threads : ' + hThreads + ', ' + wThreads1 + ', ' + gThreads + ', ' + wThreads2);
            ns.print('HWGW times   : ' + ns.formatNumber(hkTime, 0, 1000000) + ', ' + ns.formatNumber(wkTime, 0, 1000000) + ', ' + ns.formatNumber(gwTime, 0, 1000000) + ', ' + ns.formatNumber(wkTime, 0, 1000000));
            ns.print('HWGW delays  : ' + ns.formatNumber(hkDelay, 0, 1000000) + ', ' + ns.formatNumber(wk1Delay, 0, 1000000) + ', ' + ns.formatNumber(gwDelay, 0, 1000000) + ', ' + ns.formatNumber(wk2Delay, 0, 1000000));
            ns.print('HWGW ends    : ' + ns.formatNumber(hkDelay + hkTime, 0, 1000000) + ', ' + ns.formatNumber(wkTime + wk1Delay, 0, 1000000) + ', ' + ns.formatNumber(gwTime + gwDelay, 0, 1000000) + ', ' + ns.formatNumber(wkTime + wk2Delay, 0, 1000000));
            ns.print('hackPID: ' + hackPID);
            if (timeToStarth > 0) {
                ns.print('hack will initiate process in: ' + ns.tFormat(timeToStarth));
            } else {
                ns.print('hack has started and will commit/end in: ' + ns.tFormat(timeRemainingh));
            }
            ns.print('weakPID1: ' + weakPID1);
            ns.print('1st weaken will commit/end in: ' + ns.tFormat(timeRemainingw1));
            ns.print('growPID: ' + growPID);
            if (timeToStartg > 0) {
                ns.print('grow will initiate process in: ' + ns.tFormat(timeToStartg));
            } else {
                ns.print('grow has started and will commit/end in ' + ns.tFormat(timeRemainingg));
            }
            ns.print('weakPID2: ' + weakPID2);
            ns.print('2nd weaken will commit/end in: ' + ns.tFormat(timeRemainingw2));
            await ns.sleep(100);
        }

        ns.print('Countdown Complete.');

    }
} //make sure grow.js, weak.js, and hack.js exist
