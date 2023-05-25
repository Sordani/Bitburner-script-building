/** @param {NS} ns */
export async function main(ns) {
	const target = ns.args[0];
	try { ns.brutessh(target) } catch {}
	try { ns.ftpcrack(target) } catch {}
	try { ns.sqlinject(target) } catch {}
	try { ns.httpworm(target) } catch {}
	try { ns.relaysmtp(target) } catch {}
	try { ns.nuke(target) } catch {}
}

//below is commented out, but apparently does this but better, and in one line
//export let main=(n,a=(s,p)=>n.scan(s).forEach(v=>v!=p?a(v,s):[n.brutessh,n.ftpcrack,n.relaysmtp,n.sqlinject,n.httpworm,n.nuke].forEach(p=>{try{p(s)}catch{}})))=>a("home")
