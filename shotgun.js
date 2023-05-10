//importing functions from slibs.js function library for cleanliness.
import { buildramNetwork, solveGrow, isPrepped, prepTarget, countPrograms, Weight, getServerList, updateTarget, getBestTarget, optimizeShotgun, loadShotgunShells, getAccess } from "slibs.js";

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();
	const dataPort = ns.getPortHandle(ns.pid);
	dataPort.clear();

	// Spawns a special helper script for centralizing worker logs. See the script itself for details.
	if (ns.isRunning("batchlog.js", "home")) ns.scriptKill("batchlog.js", "home");
	const logPort = ns.exec("batchlog.js", "home");
	ns.atExit(() => ns.kill(logPort));  // Kill the logger when the controller ends.
	await ns.sleep(1000); // This is just to give the helper a moment to initialize.

	while (true) {//while loop starts here once we get this shotgun working
		await getAccess(ns, getServerList(ns));

		const ramNetwork = [];
		const values = {
			totalThreads: 0,
			optimalTarget: 'n00dles',
			maxBlockSize: 0,
			minBlockSize: Infinity,
			depth: 0,
			spacer: 5,
			buffer: 2000,
			greed: 0,
			hThreads: 0,
			gThreads: 0,
			wThreads1: 0,
			wThreads2: 0,
			batchSize: 0,
			shots: 0,
			shells: 0
		}

		buildramNetwork(ns, ramNetwork, values);
		//values.optimalTarget = getBestTarget(ns, updateTarget(ns)); //best target
		values.optimalTarget = updateTarget(ns).sort((a, b) => b.score - a.score)[1].name //secondbest

		if (!isPrepped(ns, values.optimalTarget)) {
			await prepTarget(ns, values.optimalTarget);
		}

		optimizeShotgun(ns, ramNetwork, values);

		const server = ns.getServer(values.optimalTarget);
		const player = ns.getPlayer();
		const shells = []; //new array of blocks from ramNetwork that will contain batchspace value

		loadShotgunShells(ns, ramNetwork, values, shells); //function that fills shells
		shells.sort((x, y) => x.batchSpace - y.batchSpace); //sorts from smallest to largest
		ns.writePort(logPort, JSON.stringify(values));
		ns.writePort(logPort, JSON.stringify(shells));

		const wTime = ns.getWeakenTime(values.optimalTarget);
		const hTime = wTime / 4;
		const gTime = hTime * 3.2;
		const times = { hack: hTime, weaken1: wTime, grow: gTime, weaken2: wTime };

		let batchEnd;
		let batchCounter = 0;

		while (values.maxBlockSize >= values.batchSize) {
			const jobs = ["weaken2", "grow", "weaken1", "hack"];
			const offset = values.spacer * batchCounter * 4; // You can see how we'r using the spacer more clearly here.
			const hEnd = Date.now() + wTime + values.buffer + values.spacer * 1 + offset;
			const wEnd1 = Date.now() + wTime + values.buffer + values.spacer * 2 + offset;
			const gEnd = Date.now() + wTime + values.buffer + values.spacer * 3 + offset;
			const wEnd2 = Date.now() + wTime + values.buffer + values.spacer * 4 + offset;

			const ends = { hack: hEnd, weaken1: wEnd1, grow: gEnd, weaken2: wEnd2 };
			const scripts = { hack: "hack.js", weaken1: "weak.js", grow: "grow.js", weaken2: "weak.js" };
			const threads = { hack: values.hThreads, weaken1: values.wThreads1, grow: values.gThreads, weaken2: values.wThreads2 };

			for (const block of shells) {
				while (block.batchSpace > 0) {
					for (const job of jobs) {
						const metrics = { batch: batchCounter, target: values.optimalTarget, job: job, time: times[job], end: ends[job], port: ns.pid, log: logPort };
						ns.scp(scripts[job], block.server);
						ns.exec(scripts[job], block.server, threads[job], JSON.stringify(metrics));
					}
					block.batchSpace -= 1;
					if (block.batchSpace === 0) block.used = true;
				}
				values.shells -= 1
			}

			if (batchCounter++ > values.depth * 10) {
				// Infinite loop safety net. Should never happen unless something goes very wrong.
				ns.print("ERROR: Infinite loop failsafe triggered.");
				// If this happens, put your debugging stuff here.
				ns.print(JSON.stringify(values));
				ns.print(JSON.stringify(shells));
				return;
			}
			batchEnd = wEnd2;
		} //shotgunwhile ends here
		do {

			ns.clearLog();
			ns.print(`Target: ${values.optimalTarget}`);
			ns.print(`Batches deployed: ${batchCounter}`);
			ns.print(`Target depth: ${Math.floor(values.depth)}`);
			ns.print(`Greed level: ${Math.round(values.greed * 1000) / 10}%`);
			ns.print(`RAM allocated: ${threads.hack * 1.7 + (threads.weaken1 + threads.weaken2 + threads.grow) * 1.75 * batchCounter}/${values.totalThreads * 1.75} GBs`);
			ns.print(`Expected yield: \$${ns.formatNumber(batchCounter * (ns.hackAnalyze(values.optimalTarget) * values.hThreads) * server.moneyMax * (60000 / (values.spacer * 4 * batchCounter + wTime + values.buffer)), 2)} per minute`);
			ns.print(`Next batch at ${new Date(batchEnd).toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric", second: "numeric", hour12: true })} (~${ns.tFormat(batchEnd - Date.now())})`);
			await dataPort.nextWrite();
		} while (dataPort.read() !== batchCounter - 1);

	}
}
