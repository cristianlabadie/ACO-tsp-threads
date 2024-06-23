const { Worker } = require("worker_threads");

const Mapa = require("./clases/Mapa");
const Tour = require("./clases/Tour");

const GAMA = 5.0;
const CANTIDAD_CANDIDATOS = 25;
const CANTIDAD_HORMIGAS = 25;

const m = new Mapa("att532.dat");

m.computarProbabilidades(GAMA);
m.computarCandidatos(CANTIDAD_CANDIDATOS);

let promesas = [];

for (let i = 0; i < CANTIDAD_HORMIGAS; i++) {
	promesas.push(
		new Promise((resolve, reject) => {
			const worker = new Worker("./utils/worker.js");

			worker.on("message", (ruta) => {
				resolve(ruta);
			});

			worker.postMessage({
				mapa: m.data,
				largo: m.getSize(),
				probabilidadInicial: m.probabilidadInicial,
			});
		}),
	);
}

(async () => {
	let resultados = await Promise.all(promesas);
	let mejorTour = null;
	let mejorCosto = Number.MAX_VALUE;
	for (let i = 0; i < resultados.length; i++) {
		let ruta = resultados[i];
		let MAX = ruta.length << 1;
		let t = new Tour(ruta);
		console.log("Tour conexo", t.isConexa());
		t.costo = t.evaluar(m);

		console.log("Tour costo antes del twoOpt", t.costo);

		t.busquedaLocal(MAX, m, mejorTour);
		console.log("Tour conexo post busqueda local", t.isConexa());
		console.log("Tour costo", t.costo);
		console.log("----------------------------------");
		if (t.costo < mejorCosto) {
			mejorTour = t;
			mejorCosto = t.costo;
		}
	}

	console.log("[MEJOR Tour conexo]", mejorTour.isConexa());
	console.log("[MEJOR Tour costo]", mejorTour.costo);
	mejorTour.mostrar();
	process.exit(1);
})();
