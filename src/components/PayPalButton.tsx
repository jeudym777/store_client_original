import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface Props {
  price: number;
  description: string;
  productId: number;
}

export default function PayPalButton({ price, description, productId }: Props) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID!,
        currency: "USD",
      }}
    >
      <PayPalButtons
        createOrder={(_data, actions) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  value: price.toString(),
                  currency_code: "USD",
                },
                description,
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
  if (!actions.order) {
      console.log("ID de la orden:", data.orderID);

    // Devolver un Promise<void> explícitamente aunque no hagas nada
    return Promise.resolve();
  }

  return actions.order.capture().then(() => {
    window.location.href = `/gracias?producto=${productId}`;
  });
}}

      />
    </PayPalScriptProvider>
  );
}
