const WORDS: Record<string, number> = {
  one: 1,
  a: 1,
  an: 1,
  single: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10
};

export function parseQuantityFromPrefix(prefix: string): number {
  const trimmed = prefix.trim().toLowerCase();
  const digitMatch = trimmed.match(/(\d+)\s*$/);
  if (digitMatch) return Number(digitMatch[1]);

  const words = trimmed.split(/\s+/).filter(Boolean);
  for (let i = words.length - 1; i >= 0; i -= 1) {
    const clean = words[i].replace(/[^a-z]/g, "");
    if (WORDS[clean]) return WORDS[clean];
  }
  return 1;
}
