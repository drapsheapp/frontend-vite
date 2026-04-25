const steps = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function OrderStatusStepper({ status }) {
  return (
    <div className="flex justify-between mt-8">
      {steps.map((step, index) => {
        const active = steps.indexOf(status) >= index;

        return (
          <div key={step} className="flex-1 text-center">
            <div
              className={`h-4 w-4 mx-auto rounded-full ${
                active ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <p className="text-xs mt-2">{step}</p>
          </div>
        );
      })}
    </div>
  );
}