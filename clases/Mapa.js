const fs = require("fs");
class Mapa {
	constructor(filename) {
		this.data = [];
		this.probabilidadInicial = [];
		this.candidatosDeNodo = [];

		if (filename) {
			this.loadFromFile(filename);
		}
	}

	loadFromFile(filename) {
		const data = fs.readFileSync(`./datos/${filename}`, "utf8");
		this.data = JSON.parse(data);
	}

	getSize() {
		return this.data.length;
	}

	computarCandidatos(TAMVEC) {
		const n = this.data.length;
		let candidatosDeNodo = [];

		for (let i = 0; i < n; i++) {
			const cola = [];
			for (let j = 0; j < n; j++) {
				if (i === j) continue;
				cola.push([this.data[i][j], j]);
			}
			cola.sort((a, b) => a[0] - b[0]);

			const candidatos = [];
			for (let k = 0; k < TAMVEC; k++) {
				const [peso, nodo] = cola[k];
				candidatos.push(nodo);
			}
			candidatosDeNodo.push(candidatos);
		}

		this.candidatosDeNodo = candidatosDeNodo;
	}

	computarProbabilidades(GAMA) {
		let n = this.getSize();
		this.probabilidadInicial = new Array(n);
		for (let i = 0; i < n; i++) {
			this.probabilidadInicial[i] = new Array(n).fill(0.0);
		}

		for (let i = 0; i < n - 1; i++) {
			for (let j = i + 1; j < n; j++) {
				// let p = 1.0 / Math.pow(this.data[i][j], GAMA);
				let p = 1.0 / this.data[i][j];
				this.probabilidadInicial[i][j] = p;
				this.probabilidadInicial[j][i] = p;
			}
		}
	}
}

module.exports = Mapa;
