const Mutex = require("async-mutex").Mutex;
const Worker = require("worker_threads").Worker;
const WorKerUtils = require("../utils/tools");
const path = require("path");
const { parse, stringify } = require("flatted");

class Colonia {
	constructor(m, TAU_MIN) {
		this.m = m;
		this.tau = [];
		this.mejor = null;

		let n = this.m.data.length;

		this.tau = new Array(n);
		for (let i = 0; i < n; i++) {
			// tau[i].resize(n,TAU_MIN); //inicializa valores a valor minimo
			this.tau[i] = new Array(n).fill(TAU_MIN);
		}
	}

	async moverHormigas(NHORMIGAS, NHILOS, RO, TAU_MIN, ALFA, BETA) {
		const buffer = new SharedArrayBuffer(
			NHORMIGAS * Int32Array.BYTES_PER_ELEMENT,
		);
		let soluciones = [];
		let hilos = [];
		let mtx = new Mutex();

		let ind = new Int32Array(1);
		ind[0] = 0;
		function getNextIndex() {
			return ind++;
		}

		for (let i = 0; i < NHILOS; i++) {
			hilos.push(
				new Promise((resolve, reject) => {
					const worker = new Worker("./utils/workerAnt.js", {
						workerData: {
							tau: this.tau,
							m: this.m.data,
							largo: this.m.data.length,
							NHORMIGAS,
							buffer,
							probabilidadInicial: this.m.probabilidadInicial,
							candidatos: this.m.candidatosDeNodo,
							ALFA,
							BETA,
						},
					});
					worker.on("message", (msg) => {
						if (msg.requestIndex) {
							const index = getNextIndex();
							worker.postMessage({ index });
						} else if (msg.result) {
							soluciones[msg.index] = parse(msg.result);
						} else if (msg === "done") {
							resolve();
						}
					});

					worker.on("error", reject);
				}),
			);
		}

		await Promise.all(hilos);
		// console.log("Todos los workers han terminado su trabajo.");
		// console.log("Arreglo compartido final:", soluciones);

		// Ordenos las soluciones por costo
		soluciones.sort((a, b) => a.costo - b.costo);

		let mejorIteracion = soluciones[0];
		if (!this.mejor || this.mejor.costo > mejorIteracion.costo) {
			this.mejor = mejorIteracion;
		}

		//EVAPORACION ADICIONAL DE LA PEOR HORMIGA

		this.evaporarAdicional(soluciones[soluciones.length - 1], RO, TAU_MIN);
	}

	updateFeromonas(tour, factor, TAU_MAX) {
		for (let n of tour.ady) {
			let origen = n.id;
			let destino = n.sig.id;
			let valor = this.tau[origen][destino] + factor / (tour.costo - 86755.0);
			if (valor > TAU_MAX) {
				valor = TAU_MAX;
			}
			this.tau[origen][destino] = valor;
			this.tau[destino][origen] = valor;
		}
	}

	evaporar(RO, TAU_MIN) {
		for (let vectorFeromonas of this.tau) {
			for (let valor of vectorFeromonas) {
				valor = (1 - RO) * valor;
				if (valor < TAU_MIN) valor = TAU_MIN;
			}
		}
	}

	async ciclo(RO, TAU_MIN, TAU_MAX, NHORMIGAS, NHILOS, FACTOR, ALFA, BETA) {
		await this.moverHormigas(NHORMIGAS, NHILOS, RO, TAU_MIN, ALFA, BETA);
		this.evaporar(RO, TAU_MIN);
		this.updateFeromonas(this.mejor, FACTOR, TAU_MAX);
	}

	evaporarAdicional(tour, RO, TAU_MIN) {
		for (let n of tour.ady) {
			let origen = n.id;
			let destino = n.sig.id;
			if (
				this.mejor.ady[origen].sig.id != destino &&
				this.mejor.ady[origen].ant.id != destino
			) {
				let valor = (1 - RO) * this.tau[origen][destino];
				if (valor < TAU_MIN) valor = TAU_MIN;
				this.tau[origen][destino] = valor;
				this.tau[destino][origen] = valor;
			}
		}
	}

	mostrarFeromonas() {
		let i = 0;
		for (let valor of this.tau[0]) {
			if (i++ > 10) break;
			// std::cout << valor << " " ;
			console.log(valor);
		}
		// std::cout<<std::endl;
		console.log("\n");
	}
}

module.exports = Colonia;
