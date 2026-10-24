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

export function centsFromDollars(dollars) {
  return Math.round(dollars * 100);
}
