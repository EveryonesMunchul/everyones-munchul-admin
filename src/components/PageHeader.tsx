interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: Props) {
  return (
    <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-gray-200">
      <div>
        <h1 className="text-[20px] font-bold text-[#1c1c1e]">{title}</h1>
        {description && <p className="text-[13px] text-gray-400 mt-0.5">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
