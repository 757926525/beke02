import React, { useState } from 'react';
import { Product, Order } from '../types';
import { ShoppingBag, CheckCircle, Package, CreditCard, ArrowRight, X } from 'lucide-react';

interface ShopViewProps {
  products: Product[];
  orders: Order[];
  onPlaceOrder: (order: {
    productId: string;
    productName: string;
    quantity: number;
    totalPrice: number;
    customerName: string;
    customerPhone: string;
    shippingAddress: string;
    paymentMethod: string;
  }) => Promise<void>;
}

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  orders,
  onPlaceOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'goods' | 'orders'>('goods');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('微信支付');
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !customerName || !shippingAddress) return;
    setSubmitting(true);
    try {
      await onPlaceOrder({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        totalPrice: Number((selectedProduct.price * quantity).toFixed(2)),
        customerName,
        customerPhone,
        shippingAddress,
        paymentMethod,
      });
      setSuccessOrder(selectedProduct.name);
      setSelectedProduct(null);
      setQuantity(1);
      setCustomerName('');
      setCustomerPhone('');
      setShippingAddress('');
      setActiveTab('orders');
    } catch (err) {
      alert('下单失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">白狐甄选 · 文创生活馆</h2>
          <p className="text-xs text-slate-500 mt-0.5">极客手作 · 原创文创周边 · 东方生活美学</p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('goods')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'goods' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            甄选好物
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
              activeTab === 'orders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>我的订单</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-600 text-[10px]">
              {orders.length}
            </span>
          </button>
        </div>
      </div>

      {successOrder && (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2 text-sky-800 text-xs font-medium">
            <CheckCircle className="w-4 h-4 text-sky-600" />
            <span>恭喜！商品【{successOrder}】下单成功，已记录至服务端订单库！</span>
          </div>
          <button onClick={() => setSuccessOrder(null)} className="text-sky-500 hover:text-sky-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Goods Grid */}
      {activeTab === 'goods' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-rose-100/80 overflow-hidden shadow-xs hover:shadow-md hover:border-rose-300 transition-all flex flex-col justify-between group"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={product.cover}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold shadow-xs">
                    {product.badge}
                  </span>
                )}
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px]">
                  已售 {product.sales}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{product.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{product.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-rose-600 font-bold">¥</span>
                    <span className="text-lg font-extrabold text-rose-600 ml-0.5">{product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-[11px] text-slate-400 line-through ml-1.5">
                        ¥{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs flex items-center space-x-1 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>立即结缘</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Orders List */
        <div className="bg-white rounded-2xl border border-rose-100/80 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center space-x-2">
            <Package className="w-4 h-4 text-rose-500" />
            <span>全量订单历史 (服务端持久化存储)</span>
          </h3>

          {orders.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10">暂无任何订单记录</p>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-slate-500">#{order.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-600 border border-sky-200">
                        {order.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{order.createdAt}</span>
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm">{order.productName} × {order.quantity}</h5>
                    <p className="text-xs text-slate-500">
                      收件人: {order.customerName} ({order.customerPhone}) | 地址: {order.shippingAddress}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400">总计金额:</span>
                    <span className="text-base font-extrabold text-rose-600 ml-1">¥{order.totalPrice.toFixed(2)}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">支付方式: {order.paymentMethod}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Checkout Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-fadeIn relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-rose-500" />
              <span>确认结缘订单</span>
            </h3>

            {/* Selected item summary */}
            <div className="p-3 bg-slate-50 rounded-xl flex items-center space-x-3 mb-4">
              <img src={selectedProduct.cover} alt={selectedProduct.name} className="w-14 h-14 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <h5 className="font-semibold text-xs text-slate-900 truncate">{selectedProduct.name}</h5>
                <p className="text-xs font-bold text-rose-600 mt-1">¥{selectedProduct.price.toFixed(2)}</p>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">结缘数量</label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-50"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm text-slate-800">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-50"
                  >
                    +
                  </button>
                  <span className="text-xs text-slate-400 ml-auto">
                    小计: <span className="font-bold text-rose-600">¥{(selectedProduct.price * quantity).toFixed(2)}</span>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">收货人姓名 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：白狐居士"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">联系电话</label>
                <input
                  type="text"
                  placeholder="13800000000"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">详细配送地址 *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="例如：浙江省杭州市西湖区青丘路 66 号"
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">支付方式</label>
                <div className="grid grid-cols-2 gap-2">
                  {['微信支付', '支付宝'].map(pay => (
                    <button
                      key={pay}
                      type="button"
                      onClick={() => setPaymentMethod(pay)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        paymentMethod === pay
                          ? 'border-rose-500 bg-rose-50 text-rose-600'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pay}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-sky-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {submitting ? '提交中...' : `确认并结缘 (¥${(selectedProduct.price * quantity).toFixed(2)})`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
