//importing functions from slibs.js function library for cleanliness.
import { buildramNetwork, solveGrow, isPrepped, prepTarget, countPrograms, Weight, getServerList, updateTarget, getBestTarget, protoGreed } from "slibs.js";

/** @param {NS} ns */
export async function main(ns) {


    let ramNetwork = [];
    const values = {
        totalThreads: 0,
        optimalTarget: 'n00dles',
        maxBlockSize: 0,
        minBlockSize: Infinity,
        hThreads: 0,
        gThreads: 0,
        wThreads1: 0,
        wThreads2: 0,
        greed: 0.99,
        maxThreads: 0,
        hackSet: 0,
    }
    //values.optimalTarget = getBestTarget(ns, updateTarget(ns)); //this gets the best target
    values.optimalTarget = updateTarget(ns).sort((a, b) => b.score - a.score)[1].name; //second best target
    buildramNetwork(ns, ramNetwork, values);

    const jobs = ['weaken2', 'grow', 'weaken1', 'hack'];

    ns.disableLog("ALL");
    ns.tail();
    const dataPort = ns.getPortHandle(ns.pid);
    dataPort.clear();

    // Spawns a special helper script for centralizing worker logs. See the script itself for details.
    if (ns.isRunning("batchlog.js", "home")) ns.scriptKill("batchlog.js", "home");
    const logPort = ns.exec("batchlog.js", "home");
    ns.atExit(() => ns.kill(logPort));  // Kill the logger when the controller ends.
    await ns.sleep(3000); // This is just to give the helper a moment to initialize.


    if (!isPrepped(ns, values.optimalTarget)) {
        await prepTarget(ns, values.optimalTarget);
        ramNetwork = [];
        values.minBlockSize = Infinity;
        values.maxBlockSize = 0;
        values.totalThreads = 0
        buildramNetwork(ns, ramNetwork, values);
    }

    const player = ns.getPlayer();
    let server = ns.getServer(values.optimalTarget);



    while (true) {
        protoGreed(ns, values);
        /* const hThreads = ns.fileExists('formulas.exe') ? Math.ceil(greed / (ns.formulas.hacking.hackPercent(server, player))) : Math.max(Math.floor(ns.hackAnalyzeThreads(values.optimalTarget, hackSet)), 1);
        server.moneyAvailable = server.moneyMax * (1 - greed);
        const gThreads = ns.fileExists('formulas.exe') ? ns.formulas.hacking.growThreads(server, player, server.moneyMax) : Math.ceil(ns.growthAnalyze(server.hostname, (server.moneyMax / server.moneyAvailable)) + 0.001);
        const wThreads1 = Math.max(Math.ceil(hThreads * 0.002 / 0.05), 1);
        const wThreads2 = Math.max(Math.ceil(gThreads * 0.004 / 0.05), 1); */
        //calculate weaken time, then hack time is one fourth weaken time, and growtime is 3.2 times hacktime.
        const wkTime = ns.getWeakenTime(server.hostname);
        const hkTime = wkTime / 4;
        const gwTime = hkTime * 3.2;
        //spacer is the tolerance for desync we're allowing. testing for as small as possible, starting at 30 ms
        const spacer = 30;
        const hkdelay = wkTime - hkTime + -5 + spacer;
        const wkdelay1 = 0 + spacer;
        const gwdelay = wkTime - gwTime + 5 + spacer;
        const wkdelay2 = 10 + spacer;
        //making blocks so we can JSON.stringify() arguments passed to worker scripts
        const threads = { hack: values.hThreads, weaken1: values.wThreads1, grow: values.gThreads, weaken2: values.wThreads2 };
        const delay = { hack: hkdelay, weaken1: wkdelay1, grow: gwdelay, weaken2: wkdelay2 };
        const scripts = { hack: 'protohack.js', weaken1: 'protoweak.js', grow: 'protogrow.js', weaken2: 'protoweak.js' };
        const portwrite = { hack: false, weaken1: false, grow: false, weaken2: true };

        for (const job of jobs) {
            const metrics = { target: values.optimalTarget, job: job, delay: delay[job], port: ns.pid, log: logPort, portwrite: portwrite[job] };
            ns.writePort(logPort, 'running ' + scripts[job] + ' at "home" with ' + threads[job] + ' threads and parameter: ' + JSON.stringify(metrics));
            ns.exec(scripts[job], 'home', threads[job], JSON.stringify(metrics));


        }

        ns.clearLog();
        ns.print('Target: ' + values.optimalTarget);
        ns.print(`Greed level: ${values.greed * 100}%`);
        ns.print('  Item       :  Hack, 1st Weaken, Grow, 2nd Weaken')
        ns.print('HWGW threads : ' + values.hThreads + ', ' + values.wThreads1 + ', ' + values.gThreads + ', ' + values.wThreads2);
        ns.print('HWGW times   : ' + ns.formatNumber(hkTime, 0, 1000000) + ', ' + ns.formatNumber(wkTime, 0, 1000000) + ', ' + ns.formatNumber(gwTime, 0, 1000000) + ', ' + ns.formatNumber(wkTime, 0, 1000000));
        ns.print(`RAM allocated: ${threads.hack * 1.7 + (threads.weaken1 + threads.weaken2 + threads.grow) * 1.75}/${values.totalThreads * 1.75} GBs`);
        ns.print(`Expected yield: \$${ns.formatNumber(values.hackSet * (1000 / (wkTime + 20 + spacer)), 2)} per second`);
        ns.print(`Next batch at ${new Date(Date.now() + wkdelay2 + wkTime).toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric", second: "numeric", hour12: true })} (~${ns.tFormat(wkTime + 20 + spacer)})`);

        //values.optimalTarget = getBestTarget(ns, updateTarget(ns)).name; //gets best target
        values.optimalTarget = updateTarget(ns).sort((a, b) => b.score - a.score)[1].name //second best target
        server = ns.getServer(values.optimalTarget);

        await dataPort.nextWrite();

        if (!isPrepped(ns, values.optimalTarget)) {
            await prepTarget(ns, values.optimalTarget);
        }

        ramNetwork = [];
        values.minBlockSize = Infinity;
        values.maxBlockSize = 0;
        values.totalThreads = 0
        buildramNetwork(ns, ramNetwork, values);
        ramNetwork.sort((x, y) => x.ram - y.ram);
    }
} //make sure protogrow.js, protoweak.js, and protohack.js exist
