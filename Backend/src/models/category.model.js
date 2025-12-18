import mongoose from "mongoose";
import slugify from "slugify";

/* SubCategory Schema */
const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    slug: {
      type: String,
      lowercase: true
    },
    image: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

/* Category Schema */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },
    subCategory: [subCategorySchema],
    image: {
      type: String,
      required: true
    },
  },
  { timestamps: true }
);

/* ✅ PRE-SAVE MIDDLEWARE (slug generation) */
categorySchema.pre("save", function (next) {
  // main category slug
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true });
  }

  // subcategory slugs
  if (this.subCategory?.length) {
    this.subCategory.forEach(sub => {
      if (!sub.slug) {
        sub.slug = slugify(sub.name, { lower: true });
      }
    });
  }

  next();
});

/* Export Model */
export default mongoose.model("Category", categorySchema);
