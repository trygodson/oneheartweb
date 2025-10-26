export const numberFormatter = (number = 0) => {
  const formatted = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(number);
  return formatted;
};
window.numberFormatter = numberFormatter;
