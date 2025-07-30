import { useCart } from "@/context/CartContext";

export const CartSidebar = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();

  return (
    <div className="fixed top-0 right-0 w-[300px] h-full bg-white shadow-xl p-4 z-50 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Carrito</h2>
      {cartItems.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <ul className="space-y-4">
          {cartItems.map(item => (
            <li key={item.id} className="border p-2 rounded">
              <img src={item.image_url} className="w-20 h-20 object-cover" />
              <h3>{item.name_product}</h3>
              <p>Cantidad: {item.quantity}</p>
              <p>Precio: €{item.price}</p>
              <button onClick={() => removeFromCart(item.id)} className="text-red-500">
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={clearCart} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">
        Vaciar carrito
      </button>
    </div>
  );
};
