import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/*
  ✅ ALTERATION STATUS FLOW (INDUSTRY STANDARD)

  requested
  approved
  pickup_scheduled
  tailoring
  completed
*/

const AlterationsTab = () => {
  const { orders, loading } = useProfile();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [issueType, setIssueType] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ================= FILTER ELIGIBLE ORDERS ================= */
  // Only delivered orders allowed for alteration
  const eligibleOrders = orders.filter(
    (o) => o.status === "delivered" || o.order_status === "delivered"
  );

  /* ================= SUBMIT ALTERATION ================= */
  const submitAlteration = async () => {
    if (!selectedOrder || !issueType) {
      alert("Please select order and issue type");
      return;
    }

    try {
      setSubmitting(true);

      /*
        ✅ Future API (backend later)
        await profileAPI.createAlteration({
          order_id: selectedOrder.order_id,
          issue_type: issueType,
          note
        });
      */

      alert("Alteration request submitted successfully");

      // reset
      setSelectedOrder(null);
      setIssueType("");
      setNote("");
    } catch (e) {
      console.error("Alteration submit failed", e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-gray-500">
        Loading eligible orders...
      </p>
    );
  }

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-lg font-semibold">
          Alteration Requests
        </h2>
        <p className="text-sm text-gray-500">
          Request fitting corrections after delivery.
        </p>
      </div>

      {/* ================= NO ELIGIBLE ORDERS ================= */}
      {eligibleOrders.length === 0 && (
        <Card>
          <CardContent className="p-5 text-sm text-gray-500">
            No delivered orders available for alteration.
          </CardContent>
        </Card>
      )}

      {/* ================= ORDER SELECT ================= */}
      {eligibleOrders.length > 0 && (
        <Card>
          <CardContent className="p-5 space-y-4">

            <p className="font-medium">Select Order</p>

            <div className="space-y-2">
              {eligibleOrders.map((order) => (
                <div
                  key={order.order_id}
                  onClick={() => setSelectedOrder(order)}
                  className={`border rounded-md p-3 cursor-pointer transition ${
                    selectedOrder?.order_id === order.order_id
                      ? "border-rose-600 bg-rose-50"
                      : "hover:border-gray-400"
                  }`}
                >
                  <p className="font-medium">
                    Order #{order.order_id}
                  </p>

                  <p className="text-sm text-gray-500">
                    ₹{order.total_amount}
                  </p>
                </div>
              ))}
            </div>

          </CardContent>
        </Card>
      )}

      {/* ================= ISSUE TYPE ================= */}
      {selectedOrder && (
        <Card>
          <CardContent className="p-5 space-y-4">

            <p className="font-medium">Issue Type</p>

            <select
              className="w-full border rounded-md p-2"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
            >
              <option value="">Select Issue</option>
              <option value="tight_fit">Too Tight</option>
              <option value="loose_fit">Too Loose</option>
              <option value="length_issue">Length Issue</option>
              <option value="design_adjustment">
                Minor Design Adjustment
              </option>
            </select>

            <div>
              <p className="font-medium mb-2">
                Additional Notes (Optional)
              </p>

              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Explain fitting issue..."
              />
            </div>

            <Button
              onClick={submitAlteration}
              disabled={submitting}
              className="w-full"
            >
              {submitting
                ? "Submitting..."
                : "Submit Alteration Request"}
            </Button>

          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AlterationsTab;