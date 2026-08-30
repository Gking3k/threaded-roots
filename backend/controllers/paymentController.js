const paymentModel =
  require("../models/paymentModel");

const orderModel =
  require("../models/orderModel");

const {
  sendPaymentSubmittedEmail,
  sendPaymentConfirmedEmail,
} = require(
  "../services/orderEmailService"
);


async function markPaymentAsMade(
  req,
  res
) {
  try {
    const {
      accessToken,
    } = req.body;

    const {
      reference,
    } = req.params;

    if (!accessToken) {
      return res.status(400).json({
        message:
          "Order access token is required",
      });
    }

    const payment =
      await paymentModel.markCustomerPaid(
        reference,
        accessToken
      );

    if (!payment) {
      return res.status(404).json({
        message:
          "Order or payment not found",
      });
    }

    if (
      payment.payment_status ===
      "confirmed"
    ) {
      const order =
        await orderModel.getOrderById(
          payment.order_id
        );

      return res.json({
        message:
          "Payment has already been confirmed",
        status:
          "confirmed",
        order,
      });
    }

    const order =
      await orderModel.getOrderById(
        payment.order_id
      );

    /*
     * Email failure should not undo
     * the payment notification state.
     */
    try {
      await sendPaymentSubmittedEmail(
        order
      );
    } catch (emailError) {
      console.error(
        "Payment notification email failed:",
        emailError.message
      );
    }

    res.json({
      message:
        "Payment notification received. Awaiting verification.",
      status:
        "awaiting_confirmation",
      order,
    });
  } catch (error) {
    console.error(
      "Mark payment as made error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to submit payment notification",
    });
  }
}


async function confirmPayment(
  req,
  res
) {
  try {
    const {
      reference,
    } = req.params;

    const {
      note,
    } = req.body;

    const payment =
      await paymentModel.getPaymentByReference(
        reference
      );

    if (!payment) {
      return res.status(404).json({
        message:
          "Payment not found",
      });
    }

    if (
      payment.payment_status ===
      "confirmed"
    ) {
      const order =
        await orderModel.getOrderById(
          payment.order_id
        );

      return res.json({
        message:
          "Payment was already confirmed",
        status:
          "confirmed",
        order,
      });
    }

    const result =
      await orderModel.confirmOrderPayment(
        payment.order_id,
        req.user.id,
        note
      );

    const order =
      result.order;

    /*
     * Email is sent after the
     * database transaction succeeds.
     */
    try {
      await sendPaymentConfirmedEmail(
        order
      );
    } catch (emailError) {
      console.error(
        "Payment confirmation email failed:",
        emailError.message
      );
    }

    res.json({
      message:
        "Payment confirmed successfully",
      status:
        "confirmed",
      order,
    });
  } catch (error) {
    console.error(
      "Payment confirmation error:",
      error
    );

    res.status(
      error.statusCode || 500
    ).json({
      message:
        error.statusCode
          ? error.message
          : "Failed to confirm payment",
    });
  }
}


module.exports = {
  markPaymentAsMade,
  confirmPayment,
};