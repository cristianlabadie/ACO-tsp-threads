const Mapa = require("./clases/Mapa");
const Colonia = require("./clases/Colonia");

const GAMA = 5.0;
const CANTIDAD_CANDIDATOS = 25;
const ITERACIONES = 3;
const FACTOR = 10.0;
const NHILOS = 6;
const NHORMIGAS = 40;
const RO = 0.02;
const TAU_MIN = 0.0001;
const TAU_MAX = 4;
const NSINMEJORA = 300;
const ALFA = 0.57;
const BETA = 1.0;

(async () => {
	console.time("duracion");
	const m = new Mapa("att532.dat");

	m.computarProbabilidades(GAMA);
	m.computarCandidatos(CANTIDAD_CANDIDATOS);

	let optimos = 0;
	let suma = 0;
	let mejor = null;

	for (let j = 0; j < ITERACIONES; j++) {
		let colonia = new Colonia(m, TAU_MIN);
		console.log("Colonia", colonia.mejor);

		let nSinMejora = 0;
		let costoMejor = 10000000;
		let i = 0;

		while (nSinMejora < NSINMEJORA) {
			await colonia.ciclo(
				RO,
				TAU_MIN,
				TAU_MAX,
				NHORMIGAS,
				NHILOS,
				FACTOR,
				ALFA,
				BETA,
			);
			//colonia.mostrarFeromonas();

			if (colonia.mejor.costo < costoMejor) {
				costoMejor = colonia.mejor.costo;
				nSinMejora = 0;
				console.log(i, "COSTO MEJOR:", colonia.mejor.costo);
			} else {
				console.log(i, "nSinMejora", nSinMejora);
				nSinMejora++;
			}
			i++;
		}
		console.log("saliendo de las iteraciones sin mejora");
		if (colonia.mejor.costo == 86756) optimos++;
		suma += colonia.mejor.costo;
		if (!mejor || mejor.costo > colonia.mejor.costo) {
			mejor = colonia.mejor;
		}
	}
	console.timeEnd("duracion");
	console.log("optimos", optimos);
	console.log("promedio", suma / ITERACIONES);
	console.log("mejor", mejor.costo);
})();
