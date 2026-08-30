import API_URL from "../config/apiConfig";

async function adminRequest(
  endpoint,
  options = {}
) {
  const token =
    localStorage.getItem(
      "token"
    );

  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,

        headers: {
          "Content-Type":
            "application/json",

          ...(options.headers || {}),

          Authorization:
            `Bearer ${token}`,
        },
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Request failed"
    );
  }

  return data;
}

async function adminMultipartRequest(
  endpoint,
  formData,
  options = {}
) {
  const token =
    localStorage.getItem(
      "token"
    );

  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,

        headers: {
          ...(options.headers || {}),

          Authorization:
            `Bearer ${token}`,
        },

        body:
          formData,
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Upload failed"
    );
  }

  return data;
}

export function getProductImages(
  productId
) {
  return adminRequest(
    `/products/${productId}/images`
  );
}


export function uploadProductImages(
  productId,
  files
) {
  const formData =
    new FormData();

  files.forEach(
    (file) => {
      formData.append(
        "images",
        file
      );
    }
  );

  return adminMultipartRequest(
    `/products/${productId}/images`,
    formData,
    {
      method: "POST",
    }
  );
}


export function setPrimaryProductImage(
  productId,
  imageId
) {
  return adminRequest(
    `/products/${productId}/images/${imageId}/primary`,
    {
      method: "PATCH",
    }
  );
}


export function deleteProductImage(
  productId,
  imageId
) {
  return adminRequest(
    `/products/${productId}/images/${imageId}`,
    {
      method: "DELETE",
    }
  );
}

/* =============================
   AUTH
============================= */

export async function loginAdmin(
  email,
  password
) {
  const response =
    await fetch(
      `${API_URL}/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to log in"
    );
  }

  return data;
}

export async function setupAdmin(
  name,
  email,
  password
) {
  const response =
    await fetch(
      `${API_URL}/auth/setup-admin`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to create administrator"
    );
  }

  return data;
}


/* =============================
   DASHBOARD
============================= */

export function getAdminStats() {
  return adminRequest(
    "/admin/stats"
  );
}


/* =============================
   PRODUCTS
============================= */

export function createProduct(
  data
) {
  return adminRequest(
    "/products",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function updateProduct(
  id,
  data
) {
  return adminRequest(
    `/products/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function deleteProduct(
  id
) {
  return adminRequest(
    `/products/${id}`,
    {
      method: "DELETE",
    }
  );
}

export function createVariant(
  productId,
  data
) {
  return adminRequest(
    `/products/${productId}/variants`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function updateVariant(
  id,
  data
) {
  return adminRequest(
    `/products/variants/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function deleteVariant(
  id
) {
  return adminRequest(
    `/products/variants/${id}`,
    {
      method: "DELETE",
    }
  );
}


/* =============================
   INVENTORY
============================= */

export function getInventory() {
  return adminRequest(
    "/inventory"
  );
}

export function createInventory(
  data
) {
  return adminRequest(
    "/inventory",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function updateInventory(
  id,
  data
) {
  return adminRequest(
    `/inventory/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}


/* =============================
   CATEGORIES
============================= */

export function createCategory(
  data
) {
  return adminRequest(
    "/categories",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function updateCategory(
  id,
  data
) {
  return adminRequest(
    `/categories/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function deleteCategory(
  id
) {
  return adminRequest(
    `/categories/${id}`,
    {
      method: "DELETE",
    }
  );
}


/* =============================
   ORDERS
============================= */

export function getAdminOrders() {
  return adminRequest(
    "/orders"
  );
}

export function getAdminOrder(
  id
) {
  return adminRequest(
    `/orders/${id}`
  );
}

export function updateOrderStatus(
  id,
  status
) {
  return adminRequest(
    `/orders/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    }
  );
}

export function confirmPayment(
  reference,
  note = ""
) {
  return adminRequest(
    `/payments/${encodeURIComponent(
      reference
    )}/confirm`,
    {
      method: "PATCH",
      body: JSON.stringify({
        note,
      }),
    }
  );
}


/* =============================
   CUSTOMERS
============================= */

export function getAdminCustomers() {
  return adminRequest(
    "/customers"
  );
}

export function getAdminCustomer(
  id
) {
  return adminRequest(
    `/customers/${id}`
  );
}

export function getPaymentInfo() {
  return adminRequest(
    "/settings/payment-info"
  );
}

/* =============================
   SETTINGS
============================= */

export function updateSettings(
  data
) {
  return adminRequest(
    "/settings",
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function updatePaymentInfo(
  data
) {
  return adminRequest(
    "/settings/payment-info",
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}