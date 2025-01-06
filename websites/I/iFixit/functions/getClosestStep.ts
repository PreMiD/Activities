export async function getClosestStep() {
	const steps = document.querySelectorAll(".fragment-link"),
		closestStep = Array.from(steps).reduce((closest, step) =>
			Math.abs(step.getBoundingClientRect().top) <
			Math.abs(closest.getBoundingClientRect().top)
				? step
				: closest
		);
	return {
		stepLink: closestStep.getAttribute("href"),
		stepNumber: closestStep.querySelector(".stepValue").textContent,
		stepTitle: closestStep.querySelector(".stepTitleTitle").textContent,
	};
}
