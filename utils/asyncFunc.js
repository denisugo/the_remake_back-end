async function asyncMap(array, callback) {
  for (let index = 0; index < array.length; index++) {
    returned = await callback(array[index], index, array);
    if (returned) array[index] = returned;
    else array.splice(index, 1);
  }
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

module.exports = {
  asyncMap,
  asyncForEach,
};
