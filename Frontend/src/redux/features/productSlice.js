import { createSlice } from '@reduxjs/toolkit';
import products from '../../data/inner-data/ProductData';

const initialState = {
   products: products,
   product: null,
};

export const productSlice = createSlice({
   name: 'products',
   initialState,
   reducers: {
      single_product: (state, action) => {
         state.product = state.products.find((p) => p.id === action.payload) || null;
      },
   },
});

export const { single_product } = productSlice.actions;

export const selectProducts = (state) => state?.products?.products;
export const selectProduct = (state) => state?.products?.product;

export default productSlice.reducer;
