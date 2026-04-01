// Custom event system for cart updates
// This allows different components to update cart state across the app

const CART_UPDATED_EVENT = 'cartUpdated';

/**
 * Dispatch event when cart is updated
 * Used after adding/removing items from cart
 */
export const dispatchCartUpdate = () => {
  const event = new Event(CART_UPDATED_EVENT);
  window.dispatchEvent(event);
  console.log('📣 Cart update event dispatched');
};

/**
 * Listen for cart updates
 * Used in Header and other components that need to know about cart changes
 */
export const onCartUpdate = (callback) => {
  window.addEventListener(CART_UPDATED_EVENT, callback);
  console.log('👂 Listening for cart updates');
  
  // Return cleanup function to remove listener
  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, callback);
  };
};
