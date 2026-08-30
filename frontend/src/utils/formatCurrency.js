export function formatCurrency(
  amount
) {
  return `₦${Number(
    amount || 0
  ).toLocaleString("en-NG")}`;
}