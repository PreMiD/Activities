import { Assets } from "../presence";

import { getWorkspaceName } from "../lib/workspace";

function getEndpoint() {
	const cmLine = document.querySelector(".cm-line");

	if (!cmLine) return null;

	const childNodes = [...cmLine.childNodes],
		firstNodeContent = childNodes[0]?.textContent;

	if (!firstNodeContent) return null;

	if (childNodes[0]) return new URL(firstNodeContent).pathname;
	else {
		return childNodes
			.filter(node => node.nodeType === node.TEXT_NODE)
			.map(node => node.textContent)
			.join("");
	}
}

function getMethod() {
	const tab = document.querySelector('[id*="removable-tab"].active');

	if (!tab) return null;

	const method = tab.querySelector("span.text-tiny");

	if (!method) return null;

	return method.textContent;
}

export function Rest() {
	const endpoint = getEndpoint();

	if (!endpoint) return null;

	const method = getMethod();

	if (!method) return null;

	return {
		smallImageKey: Assets.Rest,
		smallImageText: "REST",
		details: getWorkspaceName(),
		state: `🧑‍💻 | ${method} ${endpoint}`,
	} as PresenceData;
}
