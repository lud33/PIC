type Color = 'brand' | 'green' | 'yellow' | 'red' | 'gray' | 'orange';

const colors: Record<Color, string> = {
  brand: 'bg-yellow-300 text-black border border-black',
  green: 'bg-lime-300 text-black border border-black',
  yellow: 'bg-yellow-300 text-black border border-black',
  red: 'bg-pink-300 text-black border border-black',
  gray: 'bg-gray-100 text-black border border-black',
  orange: 'bg-orange-300 text-black border border-black',
};

interface BadgeProps {
  label: string;
  color?: Color;
  dot?: boolean;
}

export function Badge({ label, color = 'gray', dot }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[color]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${color === 'green' ? 'bg-green-500' : color === 'red' ? 'bg-red-500' : color === 'brand' ? 'bg-brand' : 'bg-gray-400'}`} />}
      {label}
    </span>
  );
}
