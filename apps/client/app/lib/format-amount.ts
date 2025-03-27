export const formatAmount = (amount: number): string => {
  const formattedAmount = amount.toLocaleString("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `GH₵\u00A0${formattedAmount.substring(3)}`;
};

export const formatAmountWithoutCurrency = (amount: number): string => {
  const formattedAmount = amount.toLocaleString("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formattedAmount.substring(3)}`;
};

export const convertPesewasToCedis = (amount: number): number => {
  return amount / 100;
};

export const convertCedisToPesewas = (amount: number): number => {
  return amount * 100;
};
