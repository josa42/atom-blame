"use babel";

function async (run) {
  return () => {
    let done = false;
    waitsFor(() => done);
    run(() => done = true);
  };
}

export default async;
