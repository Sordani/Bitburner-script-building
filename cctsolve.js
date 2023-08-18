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

export function contiguousArraySum(array) {
    let maxSum = 0;
    let currentSum = 0;
    for (let i = 0; i < array.length; i++) {
        currentSum += array[i];
        if (maxSum < currentSum) { maxSum = currentSum; }
        if (currentSum < 0) { currentSum = 0; }
    }
    return maxSum;
}

export function totalWaysToSum(number) {
    const ways = [1];
    ways.length = number + 1;
    ways.fill(0, 1);
    for (let i = 1; i < number; ++i) {
        for (let j = i; j <= number; ++j) {
            ways[j] += ways[j - i];
        }
    }

    return ways[number];
}

export function totalWaysToSumII(data) {
    const number = data[0];
    const series = data[1];
    const ways = [1];
    ways.length = number + 1;
    ways.fill(0, 1);
    for (let i = 0; i < series.length; i++) {
        for (let j = series[i]; j <= number; j++) {
            ways[j] += ways[j - series[i]];
        }
    }
    return ways[number];
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
		"Find Largest Prime Factor": largestPrimeFactor,
		"Subarray with Maximum Sum": contiguousArraySum,
		"Total Ways to Sum": totalWaysToSum,
		"Total Ways to Sum II": totalWaysToSumII,
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
	for (const cct of ns.ls("home", ".cct")) {
    const type = ns.codingcontract.getContractType(cct, "home")
    const data = ns.codingcontract.getData(cct, "home")
    ns.codingcontract.attempt(solver[type](data), cct, "home")
  }

}
