Promise.prototype.done = function(cb) {
  const P = this.constructor

  return this.then(
    (value) => P.resolve(cb()).then(() => value),
    (reason) =>
      P.resolve(cb()).then(() => {
        throw reason
      })
  )
}
