const StatCard = ({ title, value, icon }) => {

  return (

    <div className="bg-white border rounded-lg p-6">

      <div className="flex justify-between">

        <p className="text-sm text-gray-500">
          {title}
        </p>

        {icon}

      </div>

      <p className="text-2xl font-bold mt-2">
        {value}
      </p>

    </div>

  );

};

export default StatCard;