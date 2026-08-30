const orderModel =
  require("../models/orderModel");

const {
  sendOrderCreatedEmail,
} = require(
  "../services/orderEmailService"
);

const allowedFulfillmentMethods = [
  "delivery",
  "pickup",
];

const allowedOrderStatuses = [
  "pending",
  "processing",
  "ready",
  "dispatched",
  "delivered",
  "ready_for_pickup",
  "collected",
  "cancelled",
];

async function createOrder(
  req,
  res
) {
  try {
    const customer =
      req.body.customer;

    const fulfillmentMethod =
      req.body.fulfillmentMethod;

    const items =
      req.body.items;

    if (
      !customer ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message:
          "Customer information and order items are required",
      });
    }

    if (
      ![
        "delivery",
        "pickup",
      ].includes(
        fulfillmentMethod
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid fulfillment method",
      });
    }

    if (
      !customer.name?.trim() ||
      !customer.email?.trim() ||
      !customer.phone?.trim()
    ) {
      return res.status(400).json({
        message:
          "Name, email and phone are required",
      });
    }

    if (
      fulfillmentMethod ===
        "delivery" &&
      !customer.address?.trim()
    ) {
      return res.status(400).json({
        message:
          "Delivery address is required",
      });
    }

    const result =
      await orderModel.createOrder({
        customer: {
          name:
            customer.name.trim(),

          email:
            customer.email
              .trim()
              .toLowerCase(),

          phone:
            customer.phone.trim(),

          address:
            customer.address?.trim(),

          city:
            customer.city?.trim(),

          state:
            customer.state?.trim(),

          country:
            customer.country?.trim() ||
            "Nigeria",

          postalCode:
            customer.postalCode?.trim(),

          note:
            customer.note?.trim(),
        },

        fulfillmentMethod,

        items,
      });

    try {
      await sendOrderCreatedEmail(
        result.order
      );
    } catch (emailError) {
      console.error(
        "Order confirmation email failed:",
        emailError.message
      );
    }

    res.status(201).json({
      message:
        "Order created successfully",

      order:
        result.order,

      customerAccessToken:
        result.customerAccessToken,
    });
  } catch (error) {
    console.error(error);

    res.status(
      error.statusCode || 500
    ).json({
      message:
        error.statusCode
          ? error.message
          : "Failed to create order",
    });
  }
}

async function getOrder(
  req,
  res
) {
  try {
    const order =
      await orderModel.getOrderById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load order",
    });
  }
}

async function getOrders(
  req,
  res
) {
  try {
    const orders =
      await orderModel.getOrders();

    res.json(orders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load orders",
    });
  }
}

async function updateOrderStatus(
  req,
  res
) {
  try {
    const { status } =
      req.body;

    if (
      !allowedOrderStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid order status",
      });
    }

    const order =
      await orderModel.updateOrderStatus(
        req.params.id,
        status
      );

    if (!order) {
      return res.status(404).json({
        message:
          "Order not found",
      });
    }

    res.json({
      message:
        "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to update order status",
    });
  }
}

async function getCustomerOrder(
  req,
  res
) {
  try {
    const accessToken =
      req.headers[
        "x-order-token"
      ];

    if (!accessToken) {
      return res.status(401).json({
        message:
          "Order access token is required",
      });
    }

    const order =
      await orderModel.getCustomerOrder(
        req.params.reference,
        accessToken
      );

    if (!order) {
      return res.status(404).json({
        message:
          "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load order",
    });
  }
}

module.exports = {
  createOrder,
  getOrder,
  getOrders,
  updateOrderStatus,
  getCustomerOrder,
};