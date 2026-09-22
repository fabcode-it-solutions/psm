"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function Checkout() {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 49.99, // dynamic price
          currency: "usd",
          email: "customer@example.com",
          metadata: { orderId: "12345" }, // optional tracking
        }),
      });

      const data = await res.json();
      if (data.sessionId) {
        const stripe = await stripePromise;
        if (stripe) {
          stripe.redirectToCheckout({
            sessionId: data.sessionId,
          });
        }
      } else {
        console.error("Payment error:", data.error);
        alert(data.error || "Payment failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      {loading ? "Redirecting…" : "Pay Now"}
    </button>
  );
}
