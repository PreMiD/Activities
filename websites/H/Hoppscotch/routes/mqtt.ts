import { Assets } from "../presence";
import { getWorkspaceName } from "../lib/workspace";
import { getRealtimeEndpoint } from "../lib/realtime";

export function MQTT() {
	const endpoint = getRealtimeEndpoint();

	if (!endpoint) return null;

	return {
		smallImageKey: Assets.MQTT,
		smallImageText: "MQTT",
		details: getWorkspaceName(),
		state: `🧑‍💻 | ${endpoint}`,
	};
}
