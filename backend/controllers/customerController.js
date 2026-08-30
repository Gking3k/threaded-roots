const customerModel =
  require("../models/customerModel");

async function getCustomers(
  req,
  res
) {
  try {
    const customers =
      await customerModel.getCustomers();

    res.json(customers);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load customers",
    });
  }
}

async function getCustomer(
  req,
  res
) {
  try {
    const customer =
      await customerModel.getCustomerById(
        req.params.id
      );

    if (!customer) {
      return res.status(404).json({
        message:
          "Customer not found",
      });
    }

    res.json(customer);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load customer",
    });
  }
}

module.exports = {
  getCustomers,
  getCustomer,
};