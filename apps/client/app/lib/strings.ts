// Returns strings that matches the given string in the given array regardless of the case.
export const getMatchingStrings = (str: string, arr: StringList): string[] => {
  const reg = new RegExp(str, "i");
  return arr.filter((tag) => reg.test(tag));
};

export const safeString = (
  str: PossiblyUndefined<Nullable<string>>,
): string => {
  if (!str) return "";

  return str.trim();
};
