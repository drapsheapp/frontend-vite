import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ================= PRICE FORMAT ================= */
const formatPrice = (amount = 0) =>
  Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* ================= DATE FORMAT ================= */
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const WalletTab = () => {
  const { wallet, loading } = useProfile();

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <p className="text-sm text-gray-500">
        Loading wallet...
      </p>
    );
  }

  const balance = wallet?.balance || 0;
  const transactions = wallet?.transactions || [];

  return (
    <div className="space-y-6">

      {/* ================= WALLET BALANCE CARD ================= */}
      <Card className="bg-gradient-to-r from-royal-plum to-purple-700 text-white">
        <CardContent className="p-6 space-y-2">
          <p className="text-sm opacity-80">
            StitchStudio Wallet
          </p>

          <h2 className="text-3xl font-bold">
            ₹{formatPrice(balance)}
          </h2>

          <p className="text-xs opacity-80">
            Use wallet balance for faster checkout & instant refunds
          </p>
        </CardContent>
      </Card>

      {/* ================= TRANSACTION HISTORY ================= */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Transaction History
        </h3>

        {transactions.length === 0 ? (
          <div className="text-sm text-gray-500">
            No wallet transactions yet.
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn, index) => {
              const isCredit = txn.type === "credit";

              return (
                <Card key={index}>
                  <CardContent className="p-4 flex justify-between items-center">

                    {/* LEFT */}
                    <div>
                      <p className="font-medium">
                        {txn.description || "Wallet transaction"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {formatDate(txn.created_at)}
                      </p>
                    </div>

                    {/* RIGHT */}
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          isCredit
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {isCredit ? "+" : "-"}₹
                        {formatPrice(txn.amount)}
                      </p>

                      <Badge
                        variant="secondary"
                        className="text-xs"
                      >
                        {txn.type}
                      </Badge>
                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default WalletTab;