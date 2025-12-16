import asyncHandler from "express-async-handler";
import Product from "../models/product.model.js";
import User from "../models/user.model.js"
import ProductWishlist from "../models/productWishlist.model.js";

const addProductToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error("Product Not Found");
    }
    let wishlist = await ProductWishlist.findOne({ user: req.user._id });

    if (!wishlist) {
        wishlist = new ProductWishlist({
            user: req.user._id,
            products: [{ product: productId }],
        });
        await wishlist.save();
    } else {
        const existingProduct = wishlist.products.find(
            (item) => item.product.toString() === productId
        );
        if (existingProduct) {
            return res.status(200).json({ message: "Product Already In Wishlist", wishlist });
        }
        wishlist.products.push({ product: productId });
        await wishlist.save();
    }

    res.status(200).json({ message: "Product Added To Wishlist", wishlist });
});

const getWishlist = asyncHandler(async (req, res) => {
    const wishlist = await ProductWishlist.findOne({ user: req.user._id }).populate('products.product');

    if (!wishlist) {
        return res.status(200).json({ message: "Wishlist Fetched Successfully", wishlist: { products: [] } });
    }
    res.status(200).json({ message: "Wishlist Fetched Successfully", wishlist });
});

const removeProductFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    const wishlist = await ProductWishlist.findOne({ user: req.user._id });
    if (!wishlist) {
        res.status(404);
        throw new Error("Wishlist Not Found");
    }

    // Check if product exists in wishlist using Mongoose's efficient querying if possible, 
    // but here we have the array in memory so 'find' is fine.
    const existingProductIndex = wishlist.products.findIndex(
        (product) => product.product.toString() === productId
    );

    if (existingProductIndex === -1) {
        res.status(400);
        throw new Error("Product Not In Wishlist");
    }

    // Use Mongoose 'pull' to remove the item from the array
    wishlist.products.pull({ product: productId });

    await wishlist.save();
    res.status(200).json({ message: "Product Removed From Wishlist", wishlist });
});

export { addProductToWishlist, getWishlist, removeProductFromWishlist };