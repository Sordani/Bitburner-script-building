/** @param {NS} ns */
export async function main(ns) {
	ns.print('metrics: ' + ns.args[0]);
	const metrics = JSON.parse(ns.args[0]);
	const delay = metrics.end - metrics.time - Date.now();
	if (delay < 0) {
		if (metrics.log != null) ns.writePort(metrics.log, `ERROR: ${metrics.job} was ${-delay}ms too late.\n`);
		return;
	}
	await ns.grow(metrics.target, { additionalMsec: delay });
	const end = Date.now();
	ns.writePort(metrics.log, `Batch ${metrics.batch}: ${metrics.job} finished at ${end.toString().slice(-6)}/${Math.round(metrics.end).toString().slice(-6)}\n`);
}
