function contarPorEstado(mascotas = []) {
  return mascotas.reduce(
    (total, mascota) => {
      if (mascota.estado === 'disponible') {
        total.disponibles += 1;
      } else if (mascota.estado === 'adoptado') {
        total.adoptados += 1;
      }

      return total;
    },
    { disponibles: 0, adoptados: 0 }
  );
}

module.exports = { contarPorEstado };