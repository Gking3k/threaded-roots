import API_URL from "../config/apiConfig";

async function handleResponse(response, defaultMessage) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || defaultMessage
    );
  }

  return data;
}

export async function getHealth() {
  const response = await fetch(
    `${API_URL.replace(/\/api$/, "")}/health`
  );

  return handleResponse(
    response,
    "Failed to connect to the backend"
  );
}

export async function getProducts({
  categoryId,
  search,
  featured,
} = {}) {
  const params = new URLSearchParams();

  if (categoryId) {
    params.set(
      "categoryId",
      categoryId
    );
  }

  if (search) {
    params.set(
      "search",
      search
    );
  }

  if (featured !== undefined) {
    params.set(
      "featured",
      featured
    );
  }

  const queryString =
    params.toString();

  const response = await fetch(
    `${API_URL}/products${
      queryString
        ? `?${queryString}`
        : ""
    }`
  );

  return handleResponse(
    response,
    "Failed to fetch products"
  );
}

export async function getProduct(id) {
  const response = await fetch(
    `${API_URL}/products/${id}`
  );

  return handleResponse(
    response,
    "Failed to fetch product"
  );
}

export async function getCategories() {
  const response = await fetch(
    `${API_URL}/categories`
  );

  return handleResponse(
    response,
    "Failed to fetch categories"
  );
}

export async function getStoreSettings() {
  const response = await fetch(
    `${API_URL}/settings`
  );

  return handleResponse(
    response,
    "Failed to load store settings"
  );
}

export async function createOrder(
  orderData
) {
  const response = await fetch(
    `${API_URL}/orders`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        orderData
      ),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to create order"
    );
  }

  return data;
}

export async function getCustomerOrder(
  reference,
  accessToken
) {
  const response = await fetch(
    `${API_URL}/orders/reference/${encodeURIComponent(
      reference
    )}`,
    {
      headers: {
        "X-Order-Token":
          accessToken,
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load order"
    );
  }

  return data;
}

export async function markPaymentAsMade(
  reference,
  accessToken
) {
  const response = await fetch(
    `${API_URL}/payments/${encodeURIComponent(
      reference
    )}/mark-paid`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        accessToken,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to submit payment notification"
    );
  }

  return data;
}