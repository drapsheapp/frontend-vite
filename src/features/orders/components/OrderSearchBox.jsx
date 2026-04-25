export default function OrderSearchBox({ orderId, setOrderId, onSearch }) {
  return (
    <div className="flex gap-2">
      <input
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        placeholder="Enter Order ID"
        className="border p-3 w-full rounded-lg"
      />
      <button
        onClick={onSearch}
        className="bg-black text-white px-5 rounded-lg"
      >
        Track
      </button>
    </div>
  );
}