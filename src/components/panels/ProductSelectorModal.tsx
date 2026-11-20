import React, { useEffect, useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { PRODUCT_CATALOG, ProductConfig } from '../../types/product';
import { db } from '../../services/db';
import { Shirt, Coffee, ShoppingBag, HardHat, Sparkles, X, Check, Box } from 'lucide-react';

interface ProductSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const activeProduct = useStudioStore((s) => s.activeProduct);
  const setProduct = useStudioStore((s) => s.setProduct);
  const [customProducts, setCustomProducts] = useState<ProductConfig[]>([]);

  useEffect(() => {
    if (isOpen) {
      db.customProducts.toArray().then((records) => {
        setCustomProducts(records);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectProduct = (prod: ProductConfig) => {
    setProduct(prod.id as any);
    onClose();
  };

  const getProductIcon = (category: string, id: string) => {
    if (id === 'tshirt') return <Shirt className="w-6 h-6 text-indigo-400" />;
    if (id === 'hoodie') return <Shirt className="w-6 h-6 text-purple-400" />;
    if (id === 'mug') return <Coffee className="w-6 h-6 text-amber-400" />;
    if (id === 'totebag') return <ShoppingBag className="w-6 h-6 text-emerald-400" />;
    if (id === 'cap') return <HardHat className="w-6 h-6 text-rose-400" />;
    return <Box className="w-6 h-6 text-purple-400" />;
  };

  const allProducts = [...Object.values(PRODUCT_CATALOG), ...customProducts];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-studio-900 border border-studio-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-studio-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Select 3D Product Canvas</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Switching models automatically loads calibrated UV coordinates and print zones.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-studio-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto no-scrollbar">
          {allProducts.map((prod) => {
            const isSelected = activeProduct.id === prod.id;
            return (
              <div
                key={prod.id}
                onClick={() => handleSelectProduct(prod)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-studio-850 border-studio-750 hover:border-studio-600 hover:bg-studio-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-studio-800 border border-studio-700">
                      {getProductIcon(prod.category, prod.id)}
                    </div>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                        <Check className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : prod.isCustom ? (
                      <span className="text-[10px] font-mono font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                        CUSTOM TEMPLATE
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-sm font-bold text-white">{prod.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{prod.subtitle}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-studio-750/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{prod.zones.length} PRINT ZONES</span>
                  <span className="uppercase text-indigo-400">{prod.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
