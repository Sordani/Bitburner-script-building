/** @param {NS} ns */
export async function main(ns) {
    // the following allows a parameter passed by terminal, or a controller script, i.e. 'brain.js'
    // to dictate a target. if no target parameter is passed, checks for hacking level to set to
    // 'joesguns'. if not that, then set to 'foodnstuff'

    var target = ns.args[0];
    if (target == null){
        if(ns.getHackingLevel() > 10) {
            target = "joesguns";
        }
        else {
            target = "foodnstuff";
        }
    }

    // Defines how much money a server should have before we hack it
    // we've adjusted the original 75% to 90% of the server's max money
    const moneyThresh = ns.getServerMaxMoney(target) * 0.9;

    // Defines the maximum security level the target server can
    // have. If the target's security level is higher than this,
    // we'll weaken it before doing anything else
    // we've adjusted the original + 5 tolerance to + 2.
    const securityThresh = ns.getServerMinSecurityLevel(target) + 2;

    // Infinite loop that continously hacks/grows/weakens the target server
    while(true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            // If the server's security level is above our threshold, weaken it
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            // If the server's money is less than our threshold, grow it
            await ns.grow(target);
        } else {
            // Otherwise, hack it
            await ns.hack(target);
        }
    }
}
