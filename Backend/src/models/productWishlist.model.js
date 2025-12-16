import mongoose from "mongoose"
const productWishlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                }
            }
        ],
    },
    { timestamps: true }
)

const ProductWishlist = mongoose.model("ProductWishlist", productWishlistSchema);
export default ProductWishlist