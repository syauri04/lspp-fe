const TUKCard = ({ title, address, schedule, code, isFirst = false }: any) => {
  return (
    <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-transparent flex flex-col md:flex-row justify-between items-start gap-4">
      <div className="space-y-1">
        <h4 className="text-lg md:text-xl font-bold text-gray-800">{title}</h4>
        <p className="text-gray-600 text-sm md:text-[15px]">{address}</p>
        <p className="text-gray-400 text-sm italic pt-1">{schedule}</p>
      </div>
      <div className="flex-shrink-0">
        <span className="text-gray-300 font-medium text-sm tracking-wider">
          {code}
        </span>
      </div>
    </div>
  );
};

export default TUKCard;
