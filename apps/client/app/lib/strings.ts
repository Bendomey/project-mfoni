// Returns strings that matches the given string in the given array regardless of the case.
export const getMatchingStrings = (str: string, arr: string[]): string[] => {
  const reg = new RegExp(str, 'i')
  return arr.filter(tag => reg.test(tag))
}
