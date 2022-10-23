import { execSync } from "node:child_process";
import { basename, dirname } from "node:path";

export type ValidEventName = "push" | "pull_request";

export default function getDiff(
	type: "addedModified" | "removed" | "all" = "addedModified"
): string[] {
	const commands: Record<ValidEventName, string> = {
			push: "HEAD HEAD^",
			pull_request: `origin/main HEAD`,
		},
		eventName = process.argv[2] ? validateArg(process.argv[2]) : "pull_request",
		changedPresenceFolders = execSync(
			`git --no-pager diff --name-only --diff-filter=${
				type === "addedModified"
					? "ACMRTU"
					: type === "removed"
					? "D"
					: "ACMRTUD"
			} ${commands[eventName]}`
		)
			.toString()
			.split("\n")
			.filter(file =>
				["presence.ts", "iframe.ts", "metadata.json"].includes(basename(file))
			);

	if (!changedPresenceFolders.length) return [];

	return [...new Set(changedPresenceFolders.map(f => basename(dirname(f))))];
}

function validateArg(arg: string): ValidEventName {
	if (!["push", "pull_request"].includes(arg))
		throw new Error(`CI was not called with a valid event name: ${arg}`);
	return arg as ValidEventName;
}
