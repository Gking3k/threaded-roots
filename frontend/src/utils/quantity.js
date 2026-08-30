export function getQuantityStep(unit) {
  return unit === "piece" ? 1 : 0.5;
}

export function formatQuantity(quantity) {
  const number = Number(quantity);

  if (Number.isInteger(number)) {
    return String(number);
  }

  return number.toFixed(2).replace(/0+$/, "");
}