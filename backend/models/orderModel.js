const crypto = require("crypto");

const pool =
  require("../config/db");

function createError(
  message,
  statusCode
) {
  const error =
    new Error(message);

  error.statusCode =
    statusCode;

  return error;
}

async function createOrder({
  customer,
  fulfillmentMethod,
  items,
}) {
  const client =
    await pool.connect();

  try {
    await client.query(
      "BEGIN"
    );

    const settingsResult =
      await client.query(`
        SELECT
          id,
          delivery_fee,
          delivery_estimate,
          pickup_location,
          pickup_hours
        FROM store_settings
        WHERE id = 1
        LIMIT 1
      `);

    if (
      settingsResult.rows.length ===
      0
    ) {
      throw createError(
        "Store settings not configured",
        500
      );
    }

    const settings =
      settingsResult.rows[0];

    const paymentInfoResult =
      await client.query(`
        SELECT
          bank_name,
          account_name,
          account_number,
          payment_instructions
        FROM store_payment_info
        WHERE store_settings_id = 1
        LIMIT 1
      `);

    if (
      paymentInfoResult.rows.length ===
      0
    ) {
      throw createError(
        "Store payment information not configured",
        500
      );
    }

    const paymentInfo =
      paymentInfoResult.rows[0];

    const deliveryFee =
      fulfillmentMethod ===
      "delivery"
        ? Number(
            settings.delivery_fee
          )
        : 0;

    const customerResult =
      await client.query(
        `
          INSERT INTO customers (
            name,
            email,
            phone
          )
          VALUES ($1, $2, $3)

          ON CONFLICT (email)
          DO UPDATE SET
            name = EXCLUDED.name,
            phone = EXCLUDED.phone,
            updated_at =
              CURRENT_TIMESTAMP

          RETURNING *
        `,
        [
          customer.name,
          customer.email,
          customer.phone,
        ]
      );

    const customerRow =
      customerResult.rows[0];

    let subtotal = 0;

    const preparedItems = [];

    for (
      const item of items
    ) {
      const quantity =
        Number(item.quantity);

      if (
        !Number.isFinite(
          quantity
        ) ||
        quantity <= 0
      ) {
        throw createError(
          "Invalid item quantity",
          400
        );
      }

      const productResult =
        await client.query(
          `
            SELECT
              id,
              name,
              price,
              unit,
              active
            FROM products
            WHERE id = $1
            FOR SHARE
          `,
          [item.productId]
        );

      if (
        productResult.rows.length ===
        0
      ) {
        throw createError(
          "Product not found",
          404
        );
      }

      const product =
        productResult.rows[0];

      if (!product.active) {
        throw createError(
          `${product.name} is not available`,
          409
        );
      }

      let variant = null;
      let inventory;

      if (item.variantId) {
        const variantResult =
          await client.query(
            `
              SELECT
                id,
                variant_name,
                variant_value
              FROM product_variants
              WHERE id = $1
                AND product_id = $2
            `,
            [
              item.variantId,
              item.productId,
            ]
          );

        if (
          variantResult.rows.length ===
          0
        ) {
          throw createError(
            "Invalid product variant",
            400
          );
        }

        variant =
          variantResult.rows[0];

        const inventoryResult =
          await client.query(
            `
              SELECT
                id,
                quantity
              FROM inventory
              WHERE product_id = $1
                AND variant_id = $2
              FOR UPDATE
            `,
            [
              item.productId,
              item.variantId,
            ]
          );

        if (
          inventoryResult.rows.length ===
          0
        ) {
          throw createError(
            "Inventory record not found",
            409
          );
        }

        inventory =
          inventoryResult.rows[0];
      } else {
        const inventoryResult =
          await client.query(
            `
              SELECT
                id,
                quantity
              FROM inventory
              WHERE product_id = $1
                AND variant_id IS NULL
              FOR UPDATE
            `,
            [item.productId]
          );

        if (
          inventoryResult.rows.length ===
          0
        ) {
          throw createError(
            "Inventory record not found",
            409
          );
        }

        inventory =
          inventoryResult.rows[0];
      }

      if (
        Number(
          inventory.quantity
        ) < quantity
      ) {
        throw createError(
          `${product.name} does not have enough stock`,
          409
        );
      }

      const lineTotal =
        Math.round(
          Number(product.price) *
            quantity *
            100
        ) / 100;

      subtotal += lineTotal;

      preparedItems.push({
        productId:
          product.id,

        variantId:
          variant?.id || null,

        productName:
          product.name,

        variantName:
          variant?.variant_name ||
          null,

        variantValue:
          variant?.variant_value ||
          null,

        quantity,

        unit:
          product.unit,

        unitPrice:
          Number(product.price),

        lineTotal,
      });
    }

    subtotal =
      Math.round(
        subtotal * 100
      ) / 100;

    const totalAmount =
      Math.round(
        (subtotal + deliveryFee) *
          100
      ) / 100;

    const customerAccessToken =
      crypto
        .randomBytes(32)
        .toString("hex");

    const orderResult =
      await client.query(
        `
          INSERT INTO orders (
            customer_id,
            customer_name,
            customer_email,
            customer_phone,
            fulfillment_method,
            status,
            payment_status,
            subtotal,
            delivery_fee,
            total_amount,
            delivery_address,
            delivery_city,
            delivery_state,
            delivery_country,
            delivery_postal_code,
            customer_note,
            customer_access_token,
            delivery_estimate,
            pickup_location,
            pickup_hours
          )
          VALUES (
            $1, $2, $3, $4, $5,
            'pending',
            'pending_verification',
            $6, $7, $8,
            $9, $10, $11, $12,
            $13, $14, $15,
            $16, $17, $18
          )
          RETURNING *
        `,
        [
          customerRow.id,

          customer.name,

          customer.email,

          customer.phone,

          fulfillmentMethod,

          subtotal,

          deliveryFee,

          totalAmount,

          customer.address ||
            null,

          customer.city ||
            null,

          customer.state ||
            null,

          customer.country ||
            "Nigeria",

          customer.postalCode ||
            null,

          customer.note ||
            null,

          customerAccessToken,

          fulfillmentMethod ===
          "delivery"
            ? settings.delivery_estimate
            : null,

          fulfillmentMethod ===
          "pickup"
            ? settings.pickup_location
            : null,

          fulfillmentMethod ===
          "pickup"
            ? settings.pickup_hours
            : null,
        ]
      );

    const order =
      orderResult.rows[0];

    for (
      const item of preparedItems
    ) {
      await client.query(
        `
          INSERT INTO order_items (
            order_id,
            product_id,
            variant_id,
            product_name,
            variant_name,
            variant_value,
            quantity,
            unit,
            unit_price,
            line_total
          )
          VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10
          )
        `,
        [
          order.id,

          item.productId,

          item.variantId,

          item.productName,

          item.variantName,

          item.variantValue,

          item.quantity,

          item.unit,

          item.unitPrice,

          item.lineTotal,
        ]
      );
    }

    const reference =
      `TR-${order.id}-${crypto
        .randomBytes(6)
        .toString("hex")}`;

    await client.query(
      `
        INSERT INTO payments (
          order_id,
          provider,
          reference,
          amount,
          status,
          bank_name,
          account_name,
          account_number,
          payment_instructions
        )
        VALUES (
          $1,
          'bank_transfer',
          $2,
          $3,
          'pending',
          $4,
          $5,
          $6,
          $7
        )
      `,
      [
        order.id,

        reference,

        totalAmount,

        paymentInfo.bank_name,

        paymentInfo.account_name,

        paymentInfo.account_number,

        paymentInfo.payment_instructions,
      ]
    );

    await client.query(
      "COMMIT"
    );

    const completeOrder =
      await getOrderById(
        order.id
      );

    return {
      order:
        completeOrder,

      customerAccessToken,
    };
  } catch (error) {
    await client.query(
      "ROLLBACK"
    );

    throw error;
  } finally {
    client.release();
  }
}

async function getOrderById(id) {
  const orderResult =
    await pool.query(
      `
        SELECT
          o.id,
          o.customer_id,
          o.customer_name,
          o.customer_email,
          o.customer_phone,
          o.fulfillment_method,
          o.status,
          o.payment_status,
          o.subtotal,
          o.delivery_fee,
          o.total_amount,
          o.delivery_address,
          o.delivery_city,
          o.delivery_state,
          o.delivery_country,
          o.delivery_postal_code,
          o.customer_note,
          o.delivery_estimate,
          o.pickup_location,
          o.pickup_hours,
          o.created_at,
          o.updated_at,

          p.provider AS payment_provider,
          p.reference AS payment_reference,
          p.amount AS payment_amount,
          p.status AS payment_record_status,
          p.bank_name,
          p.account_name,
          p.account_number,
          p.payment_instructions,
          p.customer_marked_paid_at,
          p.confirmed_at

        FROM orders o

        LEFT JOIN payments p
          ON p.order_id = o.id

        WHERE o.id = $1
      `,
      [id]
    );

  if (
    orderResult.rows.length ===
    0
  ) {
    return null;
  }

  const order =
    orderResult.rows[0];

  const itemsResult =
    await pool.query(
      `
        SELECT
          id,
          product_id,
          variant_id,
          product_name,
          variant_name,
          variant_value,
          quantity,
          unit,
          unit_price,
          line_total
        FROM order_items
        WHERE order_id = $1
        ORDER BY id
      `,
      [id]
    );

  return {
    ...order,
    items:
      itemsResult.rows,
  };
}

async function getCustomerOrder(
  reference,
  accessToken
) {
  const result =
    await pool.query(
      `
        SELECT
          o.id,
          o.customer_name,
          o.customer_email,
          o.customer_phone,
          o.fulfillment_method,
          o.status,
          o.payment_status,
          o.subtotal,
          o.delivery_fee,
          o.total_amount,
          o.delivery_address,
          o.delivery_city,
          o.delivery_state,
          o.delivery_country,
          o.delivery_postal_code,
          o.delivery_estimate,
          o.pickup_location,
          o.pickup_hours,
          o.created_at,

          p.provider AS payment_provider,
          p.reference AS payment_reference,
          p.amount AS payment_amount,
          p.status AS payment_record_status,
          p.bank_name,
          p.account_name,
          p.account_number,
          p.payment_instructions,
          p.customer_marked_paid_at,
          p.confirmed_at

        FROM orders o

        JOIN payments p
          ON p.order_id = o.id

        WHERE p.reference = $1
          AND o.customer_access_token = $2
      `,
      [
        reference,
        accessToken,
      ]
    );

  if (
    result.rows.length ===
    0
  ) {
    return null;
  }

  const order =
    result.rows[0];

  const itemsResult =
    await pool.query(
      `
        SELECT
          id,
          product_name,
          variant_name,
          variant_value,
          quantity,
          unit,
          unit_price,
          line_total
        FROM order_items
        WHERE order_id = $1
        ORDER BY id
      `,
      [order.id]
    );

  return {
    ...order,

    items:
      itemsResult.rows,
  };
}

/*
 * Confirm payment and deduct inventory
 * in one database transaction.
 */
async function confirmOrderPayment(
  orderId,
  adminUserId,
  adminNote
) {
  const client =
    await pool.connect();

  try {
    await client.query(
      "BEGIN"
    );

    const orderResult =
      await client.query(
        `
          SELECT
            id,
            payment_status
          FROM orders
          WHERE id = $1
          FOR UPDATE
        `,
        [orderId]
      );

    if (
      orderResult.rows.length ===
      0
    ) {
      throw createError(
        "Order not found",
        404
      );
    }

    const order =
      orderResult.rows[0];

    if (
      order.payment_status ===
      "confirmed"
    ) {
      await client.query(
        "COMMIT"
      );

      return {
        alreadyConfirmed: true,
        order:
          await getOrderById(
            orderId
          ),
      };
    }

    const itemsResult =
      await client.query(
        `
          SELECT
            product_id,
            variant_id,
            quantity
          FROM order_items
          WHERE order_id = $1
        `,
        [orderId]
      );

    for (
      const item of itemsResult.rows
    ) {
      let inventoryResult;

      if (item.variant_id) {
        inventoryResult =
          await client.query(
            `
              SELECT
                id,
                quantity
              FROM inventory
              WHERE product_id = $1
                AND variant_id = $2
              FOR UPDATE
            `,
            [
              item.product_id,
              item.variant_id,
            ]
          );
      } else {
        inventoryResult =
          await client.query(
            `
              SELECT
                id,
                quantity
              FROM inventory
              WHERE product_id = $1
                AND variant_id IS NULL
              FOR UPDATE
            `,
            [item.product_id]
          );
      }

      if (
        inventoryResult.rows.length ===
        0
      ) {
        throw createError(
          "Inventory record not found",
          409
        );
      }

      const inventory =
        inventoryResult.rows[0];

      if (
        Number(
          inventory.quantity
        ) <
        Number(item.quantity)
      ) {
        throw createError(
          "Insufficient inventory at payment confirmation",
          409
        );
      }

      await client.query(
        `
          UPDATE inventory
          SET
            quantity =
              quantity - $1,
            updated_at =
              CURRENT_TIMESTAMP
          WHERE id = $2
        `,
        [
          item.quantity,
          inventory.id,
        ]
      );
    }

    await client.query(
      `
        UPDATE orders
        SET
          payment_status = 'confirmed',
          status = 'processing'
        WHERE id = $1
      `,
      [orderId]
    );

    await client.query(
      `
        UPDATE payments
        SET
          status = 'confirmed',
          confirmed_at =
            CURRENT_TIMESTAMP,
          confirmed_by = $1,
          admin_note = $2,
          updated_at =
            CURRENT_TIMESTAMP
        WHERE order_id = $3
      `,
      [
        adminUserId,
        adminNote || null,
        orderId,
      ]
    );

    await client.query(
      "COMMIT"
    );

    return {
      alreadyConfirmed: false,

      order:
        await getOrderById(
          orderId
        ),
    };
  } catch (error) {
    await client.query(
      "ROLLBACK"
    );

    throw error;
  } finally {
    client.release();
  }
}

async function getOrders() {
  const result =
    await pool.query(`
      SELECT
        o.id,
        o.customer_id,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.fulfillment_method,
        o.status,
        o.payment_status,
        o.subtotal,
        o.delivery_fee,
        o.total_amount,
        o.created_at,
        o.updated_at,

        p.reference AS payment_reference,
        p.status AS payment_record_status

      FROM orders o

      LEFT JOIN payments p
        ON p.order_id = o.id

      ORDER BY
        o.created_at DESC
    `);

  return result.rows;
}

async function updateOrderStatus(
  id,
  status
) {
  const result =
    await pool.query(
      `
        UPDATE orders
        SET status = $1
        WHERE id = $2
        RETURNING *
      `,
      [status, id]
    );

  return result.rows[0];
}

module.exports = {
  createOrder,
  getOrderById,
  getCustomerOrder,
  confirmOrderPayment,
  getOrders,
  updateOrderStatus,
};