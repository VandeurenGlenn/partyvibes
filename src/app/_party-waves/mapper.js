const map = new Map();

export default {
  set: (id, params) => map.set(id, params),
  get: id => map.get(id),
  collision: (x, y, width, height) => {

  },
  map
}
