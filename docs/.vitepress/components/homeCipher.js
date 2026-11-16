let sharedCorpus = null;

export function getDilutionCorpus(Abracadabra) {
  if (!sharedCorpus) sharedCorpus = new Abracadabra.DilutionCorpus();
  return sharedCorpus;
}

// Match the real decoder's PayloadLetter alphabet, never a visual approximation.
// A sentence shares one color; particles, literal template text and punctuation
// retain the normal text color. A new paragraph also starts a new sentence.
export function markPayload(text, alphabet) {
  const payload = new Set(alphabet);
  let sentence = 0;
  let atBoundary = false;
  return Array.from(text).map((char) => {
    if (atBoundary && !/[\s”’」』]/u.test(char)) {
      sentence++;
      atBoundary = false;
    }
    const token = {
      char,
      payload: payload.has(char),
      sentence,
      tone: sentence % 3,
    };
    if (/[。！？\n]/u.test(char)) atBoundary = true;
    return token;
  });
}
