const Ant = require("./clases/Ant");
const Mapa = require("./clases/Mapa");
const Tour = require("./clases/Tour");

const GAMA = 3.0;
const CANTIDAD_CANDIDATOS = 25;

const m = new Mapa("att532.dat");

m.computarProbabilidades(GAMA);
m.computarCandidatos(CANTIDAD_CANDIDATOS);

const ant = new Ant(m);

while (ant.mover()) {}

let ruta = ant.rutaSeguida;
ruta.push(ant.rutaSeguida[0]);

let t = new Tour(ruta);
console.log("Tour conexo", t.isConexa());
t.costo = t.evaluar(m);

console.log("Tour costo antes del twoOpt", t.costo);

t.busquedaLocal(1064, m, null);
console.log("Tour conexo", t.isConexa());
console.log("Tour costo", t.costo);
