/** Round a number to integer using BASIC's round-half-to-even rule. */
export default function roundHalfToEven(n: number) {
  if (n - Math.floor(n) === 0.5) {
    return Math.round(n / 2) * 2;
  } else {
    return Math.round(n);
  }
}
