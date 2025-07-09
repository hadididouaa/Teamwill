// src/hooks/UseCartInfo.js
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const UseCartInfo = () => {
   const [quantity, setQuantity] = useState(0);
   const [total, setTotal] = useState(0);

   // Retrieve cart items from redux state
   const cartItems = useSelector((state) => state.cart.cart);

   useEffect(() => {
      const cart = cartItems.reduce(
         (cartTotal, cartItem) => {
            const { price, quantity } = cartItem;
            const itemTotal = price * quantity;

            cartTotal.total += itemTotal;
            cartTotal.quantity += quantity;

            return cartTotal;
         },
         {
            total: 0,
            quantity: 0,
         }
      );
      setQuantity(cart.quantity);
      setTotal(cart.total);
   }, [cartItems]);

   return {
      quantity,
      total,
   };
}

export default UseCartInfo;
