export const NAIRA_PER_USD = 1327;

export const PRICES = {
  monthly: {
    dollars: 7,
    interval: 'monthly',
    name: 'ReClaim Supporter Monthly',
  },
  yearly: {
    dollars: 70,
    interval: 'annually',
    name: 'ReClaim Supporter Yearly',
  },
};

export function koboFromDollars(dollars) {
  return Math.round(dollars * NAIRA_PER_USD) * 100;
}
