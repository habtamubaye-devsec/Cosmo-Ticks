import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",

  initialState: {
    products: [],
    quantity: 0,
    email: "",
    total: 0,
  },

  reducers: {
    addProducts: (state, action) => {
      state.quantity += 1;
      state.products.push(action.payload);
      state.email = action.payload.email;
      state.total = action.payload.price * action.payload.quantity;
    },
    removeProducts: (state, action) => {
      const index = state.products.findIndex(
        (products) => products.id === action.payload.id
      );

      if (index !== -1) {
        state.quantity -= 1;
        state.total =
          state.products[index].price * state.products[index].quantity;
      }
    },
    clearProducts: (state) => {
      state.products = [];
      state.quantity = 0;
      state.total = 0;
    },
  },
});

export const { addProducts, removeProducts, clearProducts } = cartSlice.actions;
export default cartSlice.reducer;


/*
import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    products: [],
    quantity: 0,
    email: "",
    total: 0,
  },
  reducers: {
    addProduct: (state, action) => {
      state.products.push(action.payload);
      state.quantity = state.products.length;
      state.email = action.payload.email;
      state.total = state.products.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
    removeProduct: (state, action) => {
      state.products = state.products.filter(
        (product) => product.id !== action.payload.id
      );
      state.quantity = state.products.length;
      state.total = state.products.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
    clearProducts: (state) => {
      state.products = [];
      state.quantity = 0;
      state.total = 0;
      state.email = "";
    },
  },
});

export const { addProduct, removeProduct, clearProducts } = cartSlice.actions;
export default cartSlice.reducer;
*/