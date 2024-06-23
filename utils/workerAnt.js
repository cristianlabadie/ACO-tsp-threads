const { parentPort, workerData } = require("worker_threads");
const { stringify } = require("flatted");
const Ant = require("../clases/Ant2");

const {
	tau,
	m,
	NHORMIGAS,
	buffer,
	probabilidadInicial,
	candidatos,
	largo,
	ALFA,
	BETA,
} = workerData;

async function processAnt() {
	while (true) {
		parentPort.postMessage({ requestIndex: true });

		const { index } = await new Promise((resolve) => {
			parentPort.once("message", resolve);
		});
		if (index >= NHORMIGAS) break;

		let a = new Ant(m, largo, probabilidadInicial, tau);
		let t = a.buildTour(ALFA, BETA);
		t.busquedaLocal(1064, m, null, candidatos);
		// Serializa el objeto Tour
		const serializedTour = stringify(t);

		parentPort.postMessage({ result: serializedTour, index });
	}

	parentPort.postMessage("done");
}

processAnt().catch((err) => {
	console.error(err);
});
