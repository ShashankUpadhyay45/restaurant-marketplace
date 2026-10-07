import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  restaurantId: mongoose.Types.ObjectId;
  category: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl?: string;
  dietaryTags: Array<'VEG' | 'NON_VEG' | 'VEGAN' | 'GLUTEN_FREE' | 'HALAL' | 'CHEF_SPECIAL'>;
  variants: Array<{
    name: string;
    priceDelta: number;
  }>;
  modifierGroups: Array<{
    name: string;
    minSelection: number;
    maxSelection: number;
    options: Array<{
      name: string;
      price: number;
    }>;
  }>;
  isAvailable: boolean;
  preparationTimeMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  category: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  basePrice: { type: Number, required: true, min: 0 },
  imageUrl: { type: String },
  dietaryTags: [{
    type: String,
    enum: ['VEG', 'NON_VEG', 'VEGAN', 'GLUTEN_FREE', 'HALAL', 'CHEF_SPECIAL']
  }],
  variants: [{
    name: { type: String, required: true },
    priceDelta: { type: Number, default: 0 }
  }],
  modifierGroups: [{
    name: { type: String, required: true },
    minSelection: { type: Number, default: 0 },
    maxSelection: { type: Number, default: 1 },
    options: [{
      name: { type: String, required: true },
      price: { type: Number, default: 0 }
    }]
  }],
  isAvailable: { type: Boolean, default: true, index: true },
  preparationTimeMinutes: { type: Number, default: 20 }
}, {
  timestamps: true
});

MenuItemSchema.index({ restaurantId: 1, category: 1 });

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
