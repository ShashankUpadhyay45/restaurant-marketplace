import React, { useState, useMemo } from 'react';
import { MenuItem, Restaurant } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { X, Plus, Minus, Check, AlertCircle } from 'lucide-react';

interface Props {
  item: MenuItem | null;
  restaurant: Restaurant;
  onClose: () => void;
}

export const MenuModal: React.FC<Props> = ({ item, restaurant, onClose }) => {
  const { addItem } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    item?.variants && item.variants.length > 0 ? item.variants[0].name : undefined
  );
  const [selectedModifiers, setSelectedModifiers] = useState<Array<{ groupName: string; optionName: string; price: number }>>([]);
  const [notes, setNotes] = useState('');

  if (!item) return null;

  // Calculate current unit price based on variant and modifiers
  const currentUnitPrice = useMemo(() => {
    let price = item.basePrice;
    if (selectedVariant && item.variants) {
      const v = item.variants.find(v => v.name === selectedVariant);
      if (v) price += v.priceDelta;
    }
    for (const mod of selectedModifiers) {
      price += mod.price;
    }
    return parseFloat(price.toFixed(2));
  }, [item, selectedVariant, selectedModifiers]);

  const handleModifierToggle = (groupName: string, optionName: string, price: number, maxSelection: number) => {
    const exists = selectedModifiers.some(m => m.groupName === groupName && m.optionName === optionName);

    if (exists) {
      setSelectedModifiers(selectedModifiers.filter(m => !(m.groupName === groupName && m.optionName === optionName)));
    } else {
      // Check group max selection
      const groupSelected = selectedModifiers.filter(m => m.groupName === groupName);
      if (maxSelection === 1) {
        // Replace
        const otherGroups = selectedModifiers.filter(m => m.groupName !== groupName);
        setSelectedModifiers([...otherGroups, { groupName, optionName, price }]);
      } else if (groupSelected.length < maxSelection) {
        setSelectedModifiers([...selectedModifiers, { groupName, optionName, price }]);
      }
    }
  };

  const handleAddToCart = () => {
    addItem(restaurant._id, restaurant.name, {
      menuItemId: item._id,
      name: item.name,
      basePrice: item.basePrice,
      unitPrice: currentUnitPrice,
      quantity,
      selectedVariant,
      selectedModifiers,
      notes: notes.trim() ? notes.trim() : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Image */}
        {item.imageUrl && (
          <div className="relative h-56 bg-stone-100">
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {!item.imageUrl && (
            <div className="flex justify-end">
              <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">{item.name}</h2>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.dietaryTags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {tag.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
            <span className="font-display text-lg font-bold text-stone-900">₹{currentUnitPrice.toFixed(2)}</span>
          </div>

          <p className="mt-3 text-xs text-stone-500 leading-relaxed">{item.description}</p>

          {/* Variants */}
          {item.variants && item.variants.length > 0 && (
            <div className="mt-6 pt-5 border-t border-stone-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">Choice of Size / Portion</h4>
              <div className="space-y-2">
                {item.variants.map(v => (
                  <label
                    key={v.name}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedVariant === v.name
                        ? 'border-brand-600 bg-brand-50/50 font-semibold text-brand-900'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="radio"
                        name="variant"
                        checked={selectedVariant === v.name}
                        onChange={() => setSelectedVariant(v.name)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span>{v.name}</span>
                    </div>
                    <span>{v.priceDelta > 0 ? `+₹${v.priceDelta.toFixed(2)}` : 'Standard'}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Modifiers */}
          {item.modifierGroups && item.modifierGroups.map(group => (
            <div key={group.name} className="mt-6 pt-5 border-t border-stone-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">{group.name}</h4>
                <span className="text-[10px] text-stone-400">
                  {group.maxSelection === 1 ? 'Choose 1' : `Up to ${group.maxSelection}`}
                </span>
              </div>
              <div className="space-y-2">
                {group.options.map(opt => {
                  const isChecked = selectedModifiers.some(
                    m => m.groupName === group.name && m.optionName === opt.name
                  );
                  return (
                    <label
                      key={opt.name}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'border-brand-600 bg-brand-50/50 font-semibold text-brand-900'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input
                          type={group.maxSelection === 1 ? 'radio' : 'checkbox'}
                          checked={isChecked}
                          onChange={() => handleModifierToggle(group.name, opt.name, opt.price, group.maxSelection)}
                          className="text-brand-600 focus:ring-brand-500 rounded"
                        />
                        <span>{opt.name}</span>
                      </div>
                      <span>{opt.price > 0 ? `+₹${opt.price.toFixed(2)}` : 'Free'}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Instructions */}
          <div className="mt-6 pt-5 border-t border-stone-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">Special Chef Requests</h4>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Dressing on the side, no onions, extra cutlery"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          {/* Quantity Stepper */}
          <div className="flex items-center space-x-3 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-sm">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-stone-500 hover:text-stone-900 p-1"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold text-sm text-stone-900 w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="text-stone-500 hover:text-stone-900 p-1"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 ml-4 py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold tracking-wide shadow-md shadow-brand-600/20 transition-all flex items-center justify-between"
          >
            <span>Add To Cart</span>
            <span>₹{(currentUnitPrice * quantity).toFixed(2)}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
