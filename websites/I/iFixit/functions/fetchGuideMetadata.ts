import pLimit from "p-limit";
import { GuideData } from "../types";

const limit = pLimit(1);

export let guideMetadata: {
	url: string;
	data?: GuideData;
} | null = null;

export async function fetchGuideMetadata(id: string): Promise<void> {
	await limit(async () => {
		if (guideMetadata?.url === document.location.href) return;

		guideMetadata = { url: document.location.href };
		guideMetadata.data = await (
			await fetch(`https://www.ifixit.com/api/2.0/guides/${id}`)
		).json();
	});
}

export function clearGuideMetadata(): void {
	guideMetadata = null;
}
