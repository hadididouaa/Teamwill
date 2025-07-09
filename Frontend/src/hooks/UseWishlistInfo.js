// src/hooks/UseWishlistInfo.js
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const UseWishlistInfo = () => {
   const [wishlistItems, setWishlistItems] = useState([]);
   const wishlist = useSelector((state) => state.wishlist.wishlist);

   useEffect(() => {
      setWishlistItems(wishlist);
   }, [wishlist]);

   return {
      wishlistItems,
   };
}

export default UseWishlistInfo;
