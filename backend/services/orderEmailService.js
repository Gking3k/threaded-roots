const {
  sendEmail,
} = require("../utils/email");

function formatCurrency(amount) {
  return `₦${Number(
    amount || 0
  ).toLocaleString("en-NG")}`;
}

function formatQuantity(
  quantity
) {
  const number =
    Number(quantity);

  if (
    Number.isInteger(number)
  ) {
    return String(number);
  }

  return number
    .toFixed(2)
    .replace(/0+$/, "");
}

function escapeHtml(value) {
  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

function buildItemsHtml(
  items
) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;">
            <strong>
              ${escapeHtml(
                item.product_name
              )}
            </strong>
            ${
              item.variant_value
                ? `<br>
                   <span style="color:#766c61;">
                     ${escapeHtml(
                       item.variant_value
                     )}
                   </span>`
                : ""
            }
          </td>

          <td style="padding:10px 0;text-align:center;">
            ${formatQuantity(
              item.quantity
            )}
            ${escapeHtml(
              item.unit
            )}
          </td>

          <td style="padding:10px 0;text-align:right;">
            ${formatCurrency(
              item.line_total
            )}
          </td>
        </tr>
      `
    )
    .join("");
}

function buildFulfillmentHtml(
  order
) {
  if (
    order.fulfillment_method ===
    "pickup"
  ) {
    return `
      <h3>Pickup</h3>

      <p>
        <strong>Location:</strong><br>
        ${escapeHtml(
          order.pickup_location
        )}
      </p>

      <p>
        <strong>Pickup Hours:</strong><br>
        ${escapeHtml(
          order.pickup_hours
        )}
      </p>
    `;
  }

  return `
    <h3>Delivery</h3>

    <p>
      <strong>Address:</strong><br>
      ${escapeHtml(
        order.delivery_address
      )}<br>
      ${escapeHtml(
        order.delivery_city
      )},
      ${escapeHtml(
        order.delivery_state
      )}<br>
      ${escapeHtml(
        order.delivery_country
      )}
    </p>

    <p>
      <strong>Estimated Delivery:</strong>
      ${escapeHtml(
        order.delivery_estimate
      )}
    </p>
  `;
}

async function sendOrderCreatedEmail(
  order
) {
  const subject =
    `Order #${order.id} received — Threaded Roots`;

  const html = `
    <div style="
      max-width:680px;
      margin:auto;
      font-family:Arial,sans-serif;
      color:#2b211a;
    ">

      <h1>
        Threaded Roots
      </h1>

      <p>
        Thank you for your order,
        ${escapeHtml(
          order.customer_name
        )}.
      </p>

      <h2>
        Order #${order.id}
      </h2>

      <p>
        Your order has been received and
        is awaiting payment verification.
      </p>

      <hr>

      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;">
              Fabric
            </th>

            <th>
              Quantity
            </th>

            <th style="text-align:right;">
              Amount
            </th>
          </tr>
        </thead>

        <tbody>
          ${buildItemsHtml(
            order.items
          )}
        </tbody>
      </table>

      <hr>

      <p>
        Subtotal:
        <strong>
          ${formatCurrency(
            order.subtotal
          )}
        </strong>
      </p>

      <p>
        ${
          order.fulfillment_method ===
          "delivery"
            ? `Delivery:
               <strong>
                 ${formatCurrency(
                   order.delivery_fee
                 )}
               </strong>`
            : `Pickup:
               <strong>Free</strong>`
        }
      </p>

      <h2>
        Total:
        ${formatCurrency(
          order.total_amount
        )}
      </h2>

      ${buildFulfillmentHtml(
        order
      )}

      <hr>

      <h3>
        Payment Details
      </h3>

      <p>
        <strong>Bank:</strong>
        ${escapeHtml(
          order.bank_name
        )}
      </p>

      <p>
        <strong>Account Name:</strong>
        ${escapeHtml(
          order.account_name
        )}
      </p>

      <p>
        <strong>Account Number:</strong>
        ${escapeHtml(
          order.account_number
        )}
      </p>

      <p>
        ${escapeHtml(
          order.payment_instructions
        )}
      </p>

      <p>
        After making the transfer, return
        to your order page and select
        "I've Made Payment".
      </p>

    </div>
  `;

  const text = `
Threaded Roots

Thank you for your order, ${order.customer_name}.

Order #${order.id}

Total: ${formatCurrency(
    order.total_amount
  )}

Payment:
Bank: ${order.bank_name}
Account Name: ${order.account_name}
Account Number: ${order.account_number}

${order.payment_instructions}

After making the transfer, select
"I've Made Payment".
  `;

  return sendEmail({
    to: order.customer_email,
    subject,
    html,
    text,
  });
}

async function sendPaymentSubmittedEmail(
  order
) {
  return sendEmail({
    to: order.customer_email,

    subject:
      `Payment notification received — Order #${order.id}`,

    text: `
Threaded Roots

We received your payment notification
for order #${order.id}.

Your payment is currently awaiting
verification by the store.

Order total:
${formatCurrency(
      order.total_amount
    )}

Fulfillment:
${
      order.fulfillment_method
    }

We will notify you once your payment
has been confirmed.
    `,

    html: `
      <div style="
        max-width:680px;
        margin:auto;
        font-family:Arial,sans-serif;
        color:#2b211a;
      ">
        <h1>
          Threaded Roots
        </h1>

        <h2>
          Payment notification received
        </h2>

        <p>
          We received your payment
          notification for
          <strong>
            Order #${order.id}
          </strong>.
        </p>

        <p>
          Your payment is now awaiting
          verification by the store.
        </p>

        <p>
          <strong>
            Order Total:
          </strong>
          ${formatCurrency(
            order.total_amount
          )}
        </p>

        <p>
          <strong>
            Fulfillment:
          </strong>
          ${
            order.fulfillment_method
          }
        </p>

        <p>
          We will notify you once the
          payment has been confirmed.
        </p>
      </div>
    `,
  });
}

async function sendPaymentConfirmedEmail(
  order
) {
  return sendEmail({
    to: order.customer_email,

    subject:
      `Payment confirmed — Order #${order.id}`,

    text: `
Threaded Roots

Your payment for order #${order.id}
has been confirmed.

Total:
${formatCurrency(
      order.total_amount
    )}

Fulfillment:
${
      order.fulfillment_method
    }

${
      order.fulfillment_method ===
      "pickup"
        ? `Pickup Location:
${order.pickup_location}

Pickup Hours:
${order.pickup_hours}`
        : `Estimated Delivery:
${order.delivery_estimate}

Delivery Address:
${order.delivery_address}
${order.delivery_city},
${order.delivery_state}`
    }

Your order is now being processed.
    `,

    html: `
      <div style="
        max-width:680px;
        margin:auto;
        font-family:Arial,sans-serif;
        color:#2b211a;
      ">
        <h1>
          Threaded Roots
        </h1>

        <h2>
          Payment Confirmed
        </h2>

        <p>
          Your payment for
          <strong>
            Order #${order.id}
          </strong>
          has been confirmed.
        </p>

        <p>
          <strong>
            Total:
          </strong>
          ${formatCurrency(
            order.total_amount
          )}
        </p>

        ${buildFulfillmentHtml(
          order
        )}

        <p>
          Your order is now being processed.
        </p>
      </div>
    `,
  });
}

module.exports = {
  sendOrderCreatedEmail,
  sendPaymentSubmittedEmail,
  sendPaymentConfirmedEmail,
};