export async function getClosestStep() {
	const steps = document.querySelectorAll(".step"),
		closestStep = Array.from(steps).reduce((closest, step) =>
			Math.abs(step.getBoundingClientRect().top) <
			Math.abs(closest.getBoundingClientRect().top)
				? step
				: closest
		);
	return {
		stepLink: closestStep.querySelector(".fragment-link")?.getAttribute("href"),
		stepImage: closestStep.querySelector(".stepImage img.visible"),
		stepNumber: closestStep.querySelector(".fragment-link .stepValue")
			.textContent,
		stepTitle:
			closestStep.querySelector(".fragment-link .stepTitleTitle")
				?.textContent || "",
	};
}
