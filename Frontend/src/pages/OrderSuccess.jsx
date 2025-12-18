import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import axios from "axios";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get("productId");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) return;

    axios
      .post(
        "http://localhost:8000/api/v1/order/confirm",
        { sessionId },
        { withCredentials: true }
      )
      .catch((err) => {
        // Webhook/confirm failures should not break the success page UX
        console.error("Order confirmation failed:", err?.response?.data || err);
      });
  }, [sessionId]);

  const handleGoToProduct = () => {
    if (productId) {
      navigate(`/product/${productId}`);
    } else {
      navigate("/"); // fallback to home if no productId
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6 max-w-md w-full text-center">
        <CheckCircle className="text-green-500 w-16 h-16" />
        <h1 className="text-4xl font-bold text-gray-900">Payment Successful!</h1>
        <p className="text-gray-600">Your order has been placed successfully.</p>
        <div className="text-gray-500 text-sm">
          <p><span className="font-medium">Product ID:</span> {productId}</p>
          <p><span className="font-medium">Session ID:</span> {sessionId}</p>
        </div>

        <button
          onClick={handleGoToProduct}
          className="mt-6 w-full py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
        >
          Go to Product Page
        </button>

        <button
          onClick={() => navigate("/")}
          className="mt-3 w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-100 transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default OrderSuccess;
    