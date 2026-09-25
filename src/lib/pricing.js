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

export const DONATION_DOLLARS = [5, 10, 25];

export function nairaFromDollars(dollars) {
  return Math.round(dollars * NAIRA_PER_USD);
}

export function koboFromDollars(dollars) {
  return nairaFromDollars(dollars) * 100;
}

export function formatNaira(naira) {
  return `₦${String(naira).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}
