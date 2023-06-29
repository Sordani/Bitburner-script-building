# Bitburner-script-building
Place to house and save my javascript/netscript script code and share with other for nitpicking and idea sponging.

i am a beginner programmer. I am using the game BitBurner via Steam as a tool to learn, practice, and use coding. I am attempting to use the logic I know and not rely on copypasta code from others, though i have stared at other's code for hours trying to figure out what they wanted to do so i can sponge ideas. i primarily use github as a second harddrive to save all my files.

update: 5/4/2023
I am more versed in the workings of bitburner, and having made it to endgame, am making it my mission to write all new code to optimize the game. i'm working on the progression to a continuous batcher and am upgrading how i program. i've discovered objects, maps, function importing and subsequently library scripts, as well as finished a working protobatcher. i've written scripts that do tiny tiny things like output the entire workings of ns.getServer(); to a readable log, as well as created a generic.js script that i test anything i'm workijng on.

i'm including additional scripts like the early-hack-template.js needed to run brain.js effectively, as it passes target parameters over to the early-hack-template loop. this will be made obsolete by any progress made in the controller script that will run the batches of worker scripts that will optimize hacking and removing the effect of said hacks from a prepped server, potentially across all root-accessed servers. this logic is formulating, but the goal is to get to a more optimized state than running early-hack-template.js on n00dles to hack n00dles.

update 5/31/2023
Bitnode 1 is complete. Corps are the target now, laying down the batching problem for different problems now that we have hit "working shotgun" milestone. corps were super simple in 2.2.2. now 2.3 is out, and corps have been complicated and no one knows what we're doing. optimizing the corp.js is the entire priority, as well as the eventual goal of grouping functions into Classes.

TODO:
get a working corporation script that will, given enough time, hit 1e40 money (preferably in less than 4 days, initial goal of 1 day).
rewrite slibs into classes that group all scripts that require each other into classes to export in clusters rather than remembering the names of 12 functions to export everywhere
change brain.js from the manager of early-hack-template to the automation script of bitburner. call other scripts at appropriate times, monitor the health of scripts, cancel them if they stall too long.
improve other scripts so that they can accomplish a job completely and then end to save resources.
get pretty logs to manage all the inforamtion.
next bitnode after satisfied with corps will be either sleeves or gangs.


update 6/29/2023
Bitnode 10 will be complete shortly. Corp.js updated to work in multiple scenarios of bitnode multipliers to cash (usually negative, but also could work effectively in positive environments too) and works with 2.3. changing brain.js to be the script i call that calls all the other scripts that will periodically check all the other scripts so that i can automate more of the game and be more ram efficient. shotgun.js is janky, but is bandaided by batchchecker to be killed and restarted.

TODO: upgrade to continuous batcher. chop up scripts to be more ram efficient. automate every part of the game. unlock intelligence and the requisite bitnodes that attribute to intelligence grinding optimally. unlock singularity to automate more of the game. clean up script sprawl, implement more classes to group scripts that depend on each other together. move all classes to slibs.js. make logs prettier.
