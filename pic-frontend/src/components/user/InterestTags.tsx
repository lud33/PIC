export const ALL_INTERESTS = ['Music', 'Concerts', 'Movies', 'Sports', 'Food', 'Travel', 'Art', 'Gaming', 'Festivals', 'Comedy', 'Theatre', 'Dance', 'Outdoors', 'Culture'];

interface InterestTagsProps {
  interests: string[];
  selectable?: boolean;
  selected?: string[];
  onToggle?: (interest: string) => void;
}

export function InterestTags({ interests, selectable, selected = [], onToggle }: InterestTagsProps) {
  if (selectable) {
    return (
      <div className="flex flex-wrap gap-2">
        {ALL_INTERESTS.map(interest => {
          const isSelected = selected.includes(interest);
          return (
            <button
              key={interest}
              type="button"
              onClick={() => onToggle?.(interest)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border
                ${isSelected
                  ? 'bg-yellow-300 text-black border-black shadow-[2px_2px_0px_#000]'
                  : 'bg-white text-gray-800 border-black hover:bg-cyan-200'
                }`}
            >
              {interest}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {interests.map(i => (
        <span key={i} className="px-2.5 py-1 bg-lime-300 text-black border border-black text-xs font-bold rounded-full">{i}</span>
      ))}
    </div>
  );
}
