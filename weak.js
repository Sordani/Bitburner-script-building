/** @param {NS} ns */
export async function main(ns) {
	ns.print('metrics: ' + ns.args[0]);
	const metrics = JSON.parse(ns.args[0]);
	const delay = metrics.end - metrics.time - Date.now();
	if (delay < 0) {
		ns.writePort(metrics.log, `ERROR: ${metrics.job} was ${-delay}ms too late.\n`);
		return;
	}
	await ns.weaken(metrics.target, { additionalMsec: delay });
	const end = Date.now();
	if (metrics.batch == null) metrics.batch = metrics.port;

	// Weaken2 reports batch number instead of job.
	ns.atExit(() => {
		if (metrics.job === "weaken2") ns.writePort(metrics.port, metrics.batch);
		if (!metrics.log === null) { ns.writePort(metrics.log, `Batch ${metrics.batch}: ${metrics.job} finished at ${end.toString().slice(-6)}/${Math.round(metrics.end).toString().slice(-6)}\n`); }
	});
}
