//importing functions from slibs.js function library for cleanliness.
import { buildramNetwork, solveGrow, isPrepped, prepTarget, countPrograms, Weight, getServerList, updateTarget, getBestTarget, optimizeShotgun, loadShotgunShells, getAccess } from "slibs.js";

/** @param {NS} ns */
export async function main(ns) {
	//ns.disableLog("ALL");
	ns.tail();
	ns.moveTail(1000, 200);
	const dataPort = ns.getPortHandle(ns.pid);
	dataPort.clear();

	// Spawns a special helper script for centralizing worker logs. See the script itself for details.
	if (ns.isRunning("batchlog.js", "home")) ns.scriptKill("batchlog.js", "home");
	const logPort = ns.exec("batchlog.js", "home");
	ns.atExit(() => ns.closeTail(logPort));  // Kill the logger when the controller ends.
	await ns.sleep(1000); // This is to give the helper a moment to initialize.

	while (true) {//while loop starts here once we get this shotgun working
		await getAccess(ns, getServerList(ns));

		const ramNetwork = [];
		const values = { //this got out of hand, and just became more fun to fill with other values
			totalThreads: 0,
			optimalTarget: 'n00dles',
			maxBlockSize: 0,
			minBlockSize: Infinity,
			spacer: 5,
			buffer: 2000,
			magazine: 100,
			bestIncome: 0,
			greed: 0,
			depth: 0,
			hThreads: 0,
			gThreads: 0,
			homegThreads: 0,
			wThreads1: 0,
			homewThreads1: 0,
			wThreads2: 0,
			homewThreads2: 0,
			batchSize: 0,
			homebatchSize: 0,
			shells: 0,
			shots: 0
		}

		buildramNetwork(ns, ramNetwork, values);
		values.optimalTarget = getBestTarget(ns, updateTarget(ns)); //best target
		//values.optimalTarget = 'joesguns'; //test target

		while (!isPrepped(ns, values.optimalTarget)) {
			await prepTarget(ns, values.optimalTarget);
			values.optimalTarget = getBestTarget(ns, updateTarget(ns));
			await ns.sleep(1000);
		}

		optimizeShotgun(ns, ramNetwork, values);
		const server = ns.getServer(values.optimalTarget);
		const shells = []; //new array of blocks from ramNetwork that will contain batchspace value
		loadShotgunShells(ns, ramNetwork, values, shells); //function that fills shells
		shells.sort((x, y) => x.batchSpace - y.batchSpace); //sorts from smallest to largest

		const wTime = ns.getWeakenTime(values.optimalTarget);
		const hTime = wTime / 4;
		const gTime = hTime * 3.2;
		const times = { hack: hTime, weaken1: wTime, grow: gTime, weaken2: wTime };
		const startTime = Date.now();
		let batchCounter = 0;
		let stopGap = 100; //used for spacing of batches later
		values.shots = values.depth;


		while (values.shots > 0) {
			const jobs = ["weaken2", "grow", "weaken1", "hack"];
			const offset = values.spacer * batchCounter * 4; // You can see how we'r using the spacer more clearly here.
			const hEnd = Date.now() + wTime + values.buffer + values.spacer * 1 + offset;
			const wEnd1 = Date.now() + wTime + values.buffer + values.spacer * 2 + offset;
			const gEnd = Date.now() + wTime + values.buffer + values.spacer * 3 + offset;
			const wEnd2 = Date.now() + wTime + values.buffer + values.spacer * 4 + offset;

			const ends = { hack: hEnd, weaken1: wEnd1, grow: gEnd, weaken2: wEnd2 };
			const scripts = { hack: "hack.js", weaken1: "weak.js", grow: "grow.js", weaken2: "weak.js" };
			const threads = { hack: values.hThreads, weaken1: values.wThreads1, grow: values.gThreads, weaken2: values.wThreads2 };
			const homethreads = { hack: values.hThreads, weaken1: values.homewThreads1, grow: values.homegThreads, weaken2: values.homewThreads2 };
			for (const job of jobs) {
				const metrics = { batch: batchCounter, target: values.optimalTarget, job: job, time: times[job], end: ends[job], port: ns.pid, log: logPort };
				ns.scp(scripts[job], shells[0].server);
				if (shells[0].server == 'home') {
					ns.exec(scripts[job], shells[0].server, homethreads[job], JSON.stringify(metrics));
					continue;
				}
				ns.exec(scripts[job], shells[0].server, threads[job], JSON.stringify(metrics));
			}
			if (batchCounter++ > (values.depth * 10)) {
				ns.print("ERROR: Infinite loop failsafe triggered.");
				ns.print('shells: ' + JSON.stringify(shells));
				ns.print('values: ' + JSON.stringify(values));
				ns.print('batchCounter: ' + batchCounter);
				ns.print('wTime: ' + wTime);
				ns.exit();
			}
			if (shells[0].batchSpace-- <= 0) {
				shells.shift();
			}
			//sends 100 batches, waits 1000 milliseconds. this is to combat larger ram situations
			//that cause the game to grind to a halt when you want to exec 2 million scripts.
			if (batchCounter >= stopGap) {
				stopGap += 100;
				await ns.sleep(1000);
			}
			
			values.shots--;
		}


		do {
			const runTime = Date.now() - startTime;
			ns.clearLog();
			ns.print(`Target: ${values.optimalTarget}`);
			ns.print(`Batches deployed: ${batchCounter}`);
			ns.print(`Greed level: ${Math.round(values.greed * 1000) / 10}%`);
			ns.print(`RAM allocated: ${values.hThreads * 1.7 + (values.wThreads1 + values.wThreads2 + values.gThreads) * 1.75 * batchCounter}/${values.totalThreads * 1.75} GBs`);
			ns.print(`Expected yield: \$${ns.formatNumber(batchCounter * (ns.hackAnalyze(values.optimalTarget) * values.hThreads) * server.moneyMax * (60000 / (values.spacer * 4 * batchCounter + wTime + values.buffer)), 2)} per minute`);
			ns.print(`Runtime: ${ns.tFormat(runTime, true)}`);
			
			await dataPort.nextWrite();
		} while (dataPort.read() !== batchCounter - 1);

	} //while true wraparound to the whole thing once it's working
}
