/** @param {NS} ns */
export async function main(ns) {
	const target = ns.args[0];
	// ?? checks for null and undefined statments. this syntax will set to 0 if either of those are true.
	const waitTime = ns.args[1] ?? 0;
	await ns.weaken(target,{additionalMsec:waitTime});
}
