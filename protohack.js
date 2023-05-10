/** @param {NS} ns */
export async function main(ns) {
	//metrics is an object consisting of target, delay, job, port, and portwrite values.
	//we stringify them to send multiple arguements at once to the worker
	//the worker then parses the arguements to turn them back into an object for access.
	ns.print('metrics: ' + ns.args[0]);
	const metrics = JSON.parse(ns.args[0]);
	await ns.hack(metrics.target, { additionalMsec: metrics.delay });

	
	ns.atExit(() => {
		if (metrics.portwrite == true) ns.writePort(metrics.port, metrics.job);
		try {ns.writePort(metrics.log, 'metrics: ' + ns.args[0]);} catch {}
	});
}
