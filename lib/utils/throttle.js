'use babel'

export default function throttle (fn, threshold, scope) {
  threshold = threshold || 250

  let last, timer

  const step = (time, args) => {
    last = time
    fn(...args)
  }

  return (...args) => {
    const now = new Date().getTime()

    clearTimeout(timer)

    if (last && now < last + threshold) {
      timer = setTimeout(() => step(now, args), threshold)
    } else {
      step(now, args)
    }
  }
}
