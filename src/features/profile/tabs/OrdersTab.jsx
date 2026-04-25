import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* ================= STATUS COLOR ================= */
const statusStyles = {
  confirmed: "bg-green-100 text-green-700",
  payment_pending: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

/* ================= PRICE FORMAT ================= */
const formatPrice = (amount = 0) =>
  Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const OrdersTab = () => {
  const { orders, loading } = useProfile();
  const navigate = useNavigate();

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <p className="text-sm text-gray-500">
        Loading your orders...
      </p>
    );
  }

  /* ================= EMPTY STATE ================= */
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-base md:text-lg font-medium">
          No orders yet
        </p>
        <p className="text-sm mt-1">
          Start customizing your first outfit ✨
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">

      {orders.map((order) => {
        const statusClass =
          statusStyles[order.status] ||
          "bg-gray-100 text-gray-700";

        return (
          <Card
            key={order.order_id}
            className="transition hover:shadow-md border border-gray-100"
          >
            <CardContent className="p-3 md:p-5 space-y-3 md:space-y-4">

              {/* ================= HEADER ================= */}
              <div className="flex justify-between items-start">

                <div>
                  <p className="font-semibold text-sm md:text-base text-gray-900">
                    Order #{order.order_id}
                  </p>

                  <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString("en-IN")
                      : ""}
                  </p>
                </div>

                <span
                  className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-[11px] md:text-xs font-medium ${statusClass}`}
                >
                  {order.status?.replace("_", " ")}
                </span>

              </div>

              {/* ================= ITEMS PREVIEW ================= */}
              <div className="space-y-1 text-xs md:text-sm text-gray-700">

                {order.items?.slice(0, 3).map((item, i) => (
                  <div key={i}>
                    {item.name} × {item.quantity}
                  </div>
                ))}

                {order.items?.length > 3 && (
                  <p className="text-[11px] md:text-xs text-gray-400">
                    +{order.items.length - 3} more items
                  </p>
                )}

              </div>

              {/* ================= FOOTER ================= */}
              <div className="flex justify-between items-center border-t pt-2 md:pt-3">

                <p className="font-semibold text-base md:text-lg text-gray-900">
                  ₹{formatPrice(order.total_amount)}
                </p>

                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs md:text-sm"
                  onClick={() =>
                    navigate(`/orders/${order.order_id}`)
                  }
                >
                  View Details
                </Button>

              </div>

            </CardContent>
          </Card>
        );
      })}

    </div>
  );
};

export default OrdersTab;