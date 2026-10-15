const TimelineItem = ({
  title,
  date,
  desc,
  isLast,
}: {
  title: string;
  date: string;
  desc: string;
  isLast?: boolean;
}) => (
  <div className="relative flex gap-6 pb-8">
    {!isLast && (
      <div className="absolute left-[11px] top-6 w-[2px] h-full bg-gray-100" />
    )}
    <div className="relative z-10 w-6 h-6 rounded-full bg-[#82B124] border-4 border-[#E8F3D7] shrink-0 mt-1" />
    <div className="space-y-1">
      <h4 className="font-bold text-gray-800 leading-none">{title}</h4>
      <p className="text-xs text-gray-400">{date}</p>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default TimelineItem;
