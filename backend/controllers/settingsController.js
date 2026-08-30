const settingsModel =
  require("../models/settingsModel");

async function getSettings(
  req,
  res
) {
  try {
    const settings =
      await settingsModel.getSettings();

    if (!settings) {
      return res.status(404).json({
        message:
          "Store settings not found",
      });
    }

    res.json(settings);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load store settings",
    });
  }
}

async function updateSettings(
  req,
  res
) {
  try {
    const deliveryFee =
      Number(req.body.deliveryFee);

    if (
      !req.body.storeName?.trim()
    ) {
      return res.status(400).json({
        message:
          "Store name is required",
      });
    }

    if (
      !Number.isFinite(
        deliveryFee
      ) ||
      deliveryFee < 0
    ) {
      return res.status(400).json({
        message:
          "Delivery fee must be zero or greater",
      });
    }

    const settings =
      await settingsModel.updateSettings({
        ...req.body,
        storeName:
          req.body.storeName.trim(),
        deliveryFee,
      });

    res.json(settings);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to update store settings",
    });
  }
}

async function getPaymentInfo(
  req,
  res
) {
  try {
    const paymentInfo =
      await settingsModel.getPaymentInfo();

    if (!paymentInfo) {
      return res.status(404).json({
        message:
          "Payment information not configured",
      });
    }

    res.json(paymentInfo);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load payment information",
    });
  }
}

async function updatePaymentInfo(
  req,
  res
) {
  try {
    if (
      !req.body.bankName?.trim() ||
      !req.body.accountName?.trim() ||
      !req.body.accountNumber?.trim()
    ) {
      return res.status(400).json({
        message:
          "Bank name, account name and account number are required",
      });
    }

    const paymentInfo =
      await settingsModel.updatePaymentInfo({
        ...req.body,
        bankName:
          req.body.bankName.trim(),
        accountName:
          req.body.accountName.trim(),
        accountNumber:
          req.body.accountNumber.trim(),
      });

    if (!paymentInfo) {
      return res.status(404).json({
        message:
          "Payment information record not found",
      });
    }

    res.json(paymentInfo);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to update payment information",
    });
  }
}

module.exports = {
  getSettings,
  updateSettings,
  getPaymentInfo,
  updatePaymentInfo,
};