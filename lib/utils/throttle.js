"use babel"

export default function throttle(fn, threshhold, scope) {

  threshhold = threshhold || 250;

  let last, timer;

  const step = (time, args) => {
    last = time;
    fn(...args);
  }

  return (...args) => {

    const now = new Date().getTime();

    clearTimeout(timer);

    if (last && now < last + threshhold) {
      timer = setTimeout(() => step(now, args), threshhold);
    } else {
      step(now, args)
    }
  };
}
