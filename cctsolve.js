import { getServerList } from "slibs.js";

/** @param {NS} ns */
export function solve(ns, filename, host, answer) {
	ns.print("Answer calculated: " + answer);
	let reward = ns.codingcontract.attempt(answer, filename, host);
	if (reward) { ns.print("Coding Contract " + filename + " Solved. Reward: " + reward); }
	else { ns.print("Coding Contract " + filename + " failed. Attempts left " + ns.codingcontract.getNumTriesRemaining(filename, host)); }
}

/** @param {NS} ns */
export function largestPrimeFactor(number) {
	let divisor = 2;
	while (number > 1) {
		if (number % divisor === 0) { number /= divisor; }
		else { divisor++; }
	}
	return divisor;
}

/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	//let contractServers = getServerList(ns).filter((server) => ns.ls(server, ".cct").length > 0);
	const host = "home";
	const contracts = ns.ls(host, ".cct");
	const filename = contracts[0];
	const type = ns.codingcontract.getContractType(filename, host);
	const number = ns.codingcontract.getData(filename, host);
	let answer = undefined;
	const solver = {
		"Find Largest Prime Factor": largestPrimeFactor(number),
		"Subarray with Maximum Sum": null,
		"Total Ways to Sum": null,
		"Total Ways to Sum II": null,
		"Spiralize Matrix": null,
		"Array Jumping Game": null,
		"Array Jumping Game II": null,
		"Merge Overlapping Intervals": null,
		"Generate IP Addresses": null,
		"Algorithmic Stock Trader I": null,
		"Algorithmic Stock Trader II": null,
		"Algorithmic Stock Trader III": null,
		"Algorithmic Stock Trader IV": null,
		"Minimum Path Sum in a Triangle": null,
		"Unique Paths in a Grid I": null,
		"Unique Paths in a Grid II": null,
		"Shortest Path in a Grid": null,
		"Sanitize Parentheses in Expression": null,
		"Find All Valid Math Expressions": null,
		"HammingCodes: Integer to Encoded Binary": null,
		"HammingCodes: Encoded Binary to Integer": null,
		"Proper 2-Coloring of a Graph": null,
		"Compression I: RLE Compression": null,
		"Compression II: LZ Decompression": null,
		"Compression III: LZ Compression": null,
		"Encryption I: Caesar Cipher": null,
		"Encryption II: Vigenère Cipher": null,
	}
	for (const [key, value] of Object.entries(solver)) {
		if (type == key) { answer = value }
	}
	solve(ns, filename, host, answer);

}
