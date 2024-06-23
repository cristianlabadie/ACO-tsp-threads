const Nodo = require("./Nodo");
class Tour {
	constructor(ruta) {
		this.largo = ruta.length - 1;
		this.ady = new Array(ruta.length - 1).fill(null).map(() => new Nodo());

		let anterior = ruta[0];
		let posicion = 0;
		for (let i = 1; i < ruta.length; i++) {
			posicion++;
			if (posicion === this.largo) posicion = 0;

			let id = ruta[i];
			let nodo = this.ady[id];
			nodo.posicion = posicion;
			nodo.id = id;
			nodo.ant = this.ady[anterior];

			if (i === ruta.length - 1) {
				nodo.sig = this.ady[ruta[1]];
			} else {
				nodo.sig = this.ady[ruta[i + 1]];
			}

			anterior = id;
		}
	}

	generarMejorSolucionInicial() {
		// std::uniform_int_distribution<int> dist(0,largo-1);
		// std::vector<bool> visitados (largo,false);
		const visitados = Array(this.largo).fill(false);
		// int inicial=dist(engine);
		const inicial = this.getRandom(this.largo - 1);
		let actual = inicial;
		let cont = 0;
		while (cont++ < this.largo) {
			// console.log("ady", this.ady);
			this.ady[actual].id = actual;
			visitados[actual] = true;

			let siguiente = inicial;
			if (cont < this.largo) {
				// std::vector<int> candidatos_disponibles;
				let candidatos_disponibles = [];
				// console.log("this candidatos", this.candidatosDeNodo);
				const candidatos = this.candidatosDeNodo[actual];
				// console.log("candidatos", candidatos);
				for (let c of candidatos) {
					if (!visitados[c]) candidatos_disponibles.push(c);
				}
				if (candidatos_disponibles.length > 0) {
					//seleccion por candidatos
					// std::uniform_int_distribution<int> dist2(0,candidatos_disponibles.size()-1);
					const aleatorio = this.getRandom(candidatos_disponibles.length - 1);
					siguiente = candidatos_disponibles[aleatorio];
				} else {
					//seleccion al azar
					let posible = this.getRandom(this.largo - 1);
					while (visitados[posible]) {
						posible = (posible + 1) % this.largo;
					}
					siguiente = posible;
				}
			}
			this.ady[actual].sig = this.ady[siguiente];
			this.ady[siguiente].ant = this.ady[actual];
			actual = siguiente;
		}

		//actualiza posiciones
		let inicio = this.ady[0];
		inicio.posicion = 0;
		let ptr_actual = inicio.sig;
		let pos = 1;
		while (ptr_actual != inicio) {
			ptr_actual.posicion = pos++;
			ptr_actual = ptr_actual.sig;
		}
	}

	getRandom = (largo) => {
		return Math.floor(Math.random() * largo);
	};
	evaluar(m) {
		let inicio = this.ady[0];
		let ptr = inicio.sig;
		let suma = 0;

		while (ptr != inicio) {
			suma += m[ptr.ant.id][ptr.id];
			ptr = ptr.sig;
		}
		suma += m[ptr.ant.id][ptr.id];
		return suma;
	}

	mostrar() {
		let inicio = this.ady[0];
		let actual = inicio.sig;
		let tour = "Tour: 0, ";
		while (actual != inicio) {
			tour += actual.id + ", ";
			actual = actual.sig;
		}
		tour += "0";
		console.log(tour);
	}

	ENTRE(menor, mayor, entre) {
		return (
			(menor.posicion <= entre.posicion && entre.posicion <= mayor.posicion) ||
			(mayor.posicion < menor.posicion &&
				(menor.posicion <= entre.posicion || entre.posicion <= mayor.posicion))
		);
	}

	search(t0, t1, m, mejor) {
		const aleatorio = Math.floor(Math.random() * this.largo);
		do {
			t1 = t0.sig;
			if (!mejor) break;
			if (
				mejor.ady[t0.id].sig.id !== t1.id &&
				mejor.ady[t0.id].ant.id !== t1.id
			)
				break;
			t0 = t0.sig;
		} while (t0 !== this.ady[aleatorio]);

		for (let nodo of this.candidatosDeNodo[t1.id]) {
			let g0 = m[t0.id][t1.id];

			if (g0 <= 0) continue;

			let t2 = this.ady[nodo];
			let G0 = g0 - m[t1.id][t2.id];
			if (G0 <= 0 || t1.sig == t2 || t0 == t2) {
				continue;
			} // no elige los que ya están en el tour
			let t3 = t2.ant;
			let g1 = G0 + m[t2.id][t3.id] - m[t3.id][t0.id];
			if (g1 <= 0) {
				// console.log("2opt", g1);
				for (let ct4 of this.candidatosDeNodo[t3.id]) {
					// 3opt
					let t4 = this.ady[ct4];

					if (t4 == t3.sig || t4 == t3.ant) {
						continue;
					}

					let G1 = G0 + m[t2.id][t3.id] - m[t3.id][t4.id];
					if (G1 <= 0) continue;
					let post4 = this.ENTRE(t1, t3, t4);
					// console.log("post4", post4);
					let t5 = post4 ? t4.sig : t4.ant;
					let g2 = G1 + m[t4.id][t5.id] - m[t5.id][t0.id];
					// console.log("g2", g2);
					if (g2 > 0) {
						return {
							t0,
							t1,
							t2,
							t3,
							t4,
							t5,
							ganancia: g2,
						};
					}
				}
			} else {
				//2opt
				return {
					t0,
					t1,
					t2,
					t3,
					ganancia: g1,
				};
			}
		}
		return 0;
	}

	onMover(t0, t1, t2, t3) {
		const n = this.ady.length;

		// Cálculo de elementos
		let cant1 = t3.pos - t1.pos;
		if (cant1 < 0) cant1 += n;

		let cant2 = t0.pos - t2.pos;
		if (cant2 < 0) cant2 += n;

		if (t0.sig == t1) {
			if (cant1 <= cant2) {
				this.mover(t0, t1, t2, t3);
			} else {
				this.mover(t3, t2, t1, t0);
			}
		} else {
			if (cant1 <= cant2) {
				this.mover(t1, t0, t3, t2);
			} else {
				this.mover(t2, t3, t0, t1);
			}
		}
	}

	mover(t0, t1, t2, t3) {
		let pos = t3.posicion;
		let ptr = t1;
		while (ptr !== t2) {
			ptr.posicion = pos--;
			if (pos < 0) {
				pos = this.largo - 1;
			}
			const aux = ptr.sig;
			ptr.sig = ptr.ant;
			ptr.ant = aux;
			ptr = ptr.ant;
		}
		t0.sig = t3;
		t3.ant = t0;
		t1.sig = t2;
		t2.ant = t1;
	}

	isConexa() {
		const inicio = this.ady[0];
		let actual = inicio.sig;
		let cont = 1;
		let pos = inicio.posicion;
		pos++;
		if (pos === this.ady.length) pos = 0;
		while (actual !== inicio) {
			if (pos !== actual.posicion) {
				console.log(
					"esperada : " +
						pos +
						", encontrada :" +
						actual.posicion +
						", en nodo " +
						actual.id,
				);
				return false;
			}
			pos++;
			if (pos === this.ady.length) pos = 0;
			cont++;
			if (actual.sig.ant !== actual) {
				console.log("ant mal configurado en nodo: " + actual.sig.id);
				return false;
			}
			actual = actual.sig;
			if (cont > this.ady.length) return false;
		}
		return cont === this.ady.length;
	}

	getRandom(valor) {
		return Math.floor(Math.random() * valor);
	}

	busquedaLocal(MAX, mapa, mejor, candidatos) {
		//busqueda local
		let nSinMejora = 0;
		while (nSinMejora < MAX) {
			let ganancia = this.twoOpt(this.ady, mejor, mapa, candidatos, this.ady);
			if (ganancia > 0) {
				nSinMejora = 0;
				this.costo -= ganancia;
			} else {
				nSinMejora++;
			}
		}
	}

	twoOpt(nodeRoutes, mejor, mapa, candidatos, ady) {
		// console.log("mejor", mejor);
		let inicio = nodeRoutes[Math.floor(Math.random() * nodeRoutes.length)];
		// console.log("candidatos", candidatos);
		let t0 = inicio;
		let t1;

		while (true) {
			t1 = t0.sig;
			if (!mejor) break;
			if (mejor.ady[t0.id].sig.id != t1.id && mejor.ady[t0.id].ant.id != t1.id)
				break;
			t0 = t0.sig;
		}
		for (let nodo of candidatos[t1.id]) {
			let g0 = mapa[t0.id][t1.id];

			if (g0 <= 0) continue;

			let t2 = ady[nodo];
			let G0 = g0 - mapa[t1.id][t2.id];
			if (G0 <= 0 || t1.sig == t2 || t0 == t2) {
				continue;
			} // no elige los que ya están en el tour
			let t3 = t2.ant;
			let g1 = G0 + mapa[t2.id][t3.id] - mapa[t3.id][t0.id];
			if (g1 <= 0) {
				// console.log("3opt", g1);
				for (let ct4 of candidatos[t3.id]) {
					// 3opt
					let t4 = ady[ct4];

					if (t4 == t3.sig || t4 == t3.ant) {
						continue;
					}

					let G1 = G0 + mapa[t2.id][t3.id] - mapa[t3.id][t4.id];
					if (G1 <= 0) continue;
					let post4 = this.ENTRE(t1, t3, t4);
					// console.log("post4", post4);
					let t5 = post4 ? t4.sig : t4.ant;
					let g2 = G1 + mapa[t4.id][t5.id] - mapa[t5.id][t0.id];
					// console.log("g2", g2);
					if (g2 > 0) {
						this.onMover(t0, t1, t2, t3, nodeRoutes);
						this.onMover(t0, t3, t4, t5, nodeRoutes);
						return g2;
					}
				}
			} else {
				//2opt
				this.onMover(t0, t1, t2, t3, nodeRoutes);
				return g1;
			}
		}
		return 0;
	}
}

module.exports = Tour;
