import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const formatPrice = (amount = 0) =>
  Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const TrackOrders = () => {
  const { orders, loading } = useProfile();
  const navigate = useNavigate();

  if (loading) {
    return <p className="text-gray-500">Loading orders...</p>;
  }

  if (!orders || orders.length === 0) {
    return <p className="text-gray-500">No orders found</p>;
  }

  return (
    <div className="space-y-4">

      {orders.map((order) => (
        <Card key={order.order_id}>
          <CardContent className="p-4 flex justify-between items-center">

            <div>
              <p className="font-semibold">
                Order #{order.order_id}
              </p>

              <p className="text-sm text-gray-500">
                ₹{formatPrice(order.total_amount)}
              </p>
            </div>

            <Button
              onClick={() => navigate(`/order/${order.order_id}`)}
              className="bg-royal-plum text-white"
            >
              Track Order
            </Button>

          </CardContent>
        </Card>
      ))}

    </div>
  );
};

export default TrackOrders;