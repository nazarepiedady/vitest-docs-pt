export function add(a: number, b: number) {
  return a + b
}

export function multiply(a: number, b: number) {
  return a * b
}

export function divide(a: number, b: number) {
  // this should not be covered
  return a / b
}

export function sqrt(a: number) {
  if (a < 0)
    return Number.NaN // This should not be covered

  return Math.sqrt(a)
}

export function run() {
  // this should not be covered
  divide(1, 1)
}

/* istanbul ignore next -- @preserve */
export function ignoredFunction() {
  return 'This function is excluded from istanbul coverage'
}
