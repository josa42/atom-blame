'use babel'

function async (run) {
  return () => {
    let done = false
    waitsFor(() => done)
    let promise = run(() => (done = true))
    if (promise && promise.then) {
      promise
        .then(() => (done = true))
        .catch((err) => console.error(err && (err.stack || err.message)))
    }
  }
}

export default async
