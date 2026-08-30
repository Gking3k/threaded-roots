import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getQuantityStep,
  formatQuantity,
} from "../utils/quantity";

const CartContext = createContext(null);

const STORAGE_KEY =
  "threaded_roots_cart";

function loadStoredCart() {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    return stored
      ? JSON.parse(stored)
      : [];
  } catch (error) {
    console.error(
      "Failed to load cart:",
      error
    );

    return [];
  }
}

function CartProvider({ children }) {
  const [cartItems, setCartItems] =
    useState(loadStoredCart);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  function addToCart(item) {
    const step =
      getQuantityStep(item.unit);

    const existingIndex =
      cartItems.findIndex(
        (cartItem) =>
          cartItem.productId ===
            item.productId &&
          cartItem.variantId ===
            item.variantId
      );

    if (existingIndex === -1) {
      if (
        item.quantity >
        Number(item.maxStock)
      ) {
        return {
          success: false,
          message: `Only ${formatQuantity(
            item.maxStock
          )} ${item.unit}${
            Number(item.maxStock) === 1
              ? ""
              : "s"
          } available.`,
        };
      }

      setCartItems((current) => [
        ...current,
        {
          ...item,
          quantity: Number(
            item.quantity
          ),
        },
      ]);

      return {
        success: true,
      };
    }

    const existing =
      cartItems[existingIndex];

    const nextQuantity = Number(
      (
        existing.quantity +
        Number(item.quantity)
      ).toFixed(2)
    );

    if (
      nextQuantity >
      Number(existing.maxStock)
    ) {
      return {
        success: false,
        message: `Only ${formatQuantity(
          existing.maxStock
        )} ${existing.unit}${
          Number(existing.maxStock) === 1
            ? ""
            : "s"
        } available.`,
      };
    }

    setCartItems((current) =>
      current.map(
        (cartItem, index) =>
          index === existingIndex
            ? {
                ...cartItem,
                quantity:
                  nextQuantity,
              }
            : cartItem
      )
    );

    return {
      success: true,
    };
  }

  function updateQuantity(
    cartItemId,
    quantity
  ) {
    setCartItems((current) =>
      current.map((item) => {
        if (item.id !== cartItemId) {
          return item;
        }

        const step =
          getQuantityStep(
            item.unit
          );

        const normalized =
          Math.round(
            Number(quantity) / step
          ) * step;

        if (
          normalized <= 0
        ) {
          return null;
        }

        if (
          normalized >
          Number(item.maxStock)
        ) {
          return {
            ...item,
            quantity:
              Number(item.maxStock),
          };
        }

        return {
          ...item,
          quantity: Number(
            normalized.toFixed(2)
          ),
        };
      }).filter(Boolean)
    );
  }

  function removeFromCart(
    cartItemId
  ) {
    setCartItems((current) =>
      current.filter(
        (item) =>
          item.id !== cartItemId
      )
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const subtotal = useMemo(() => {
    const total =
      cartItems.reduce(
        (sum, item) =>
          sum +
          Number(item.price) *
            Number(item.quantity),
        0
      );

    return Number(
      total.toFixed(2)
    );
  }, [cartItems]);

  const itemCount = useMemo(() => {
    const total =
      cartItems.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity),
        0
      );

    return formatQuantity(total);
  }, [cartItems]);

  const value = {
    cartItems,
    subtotal,
    itemCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}

export default CartProvider;