import { useState } from 'react';
import { Check } from 'lucide-react';
import type { AvatarStyle, User } from '@/types';
import { Y2KAvatar } from '@/components/user/Y2KAvatar';
import { Button } from '@/components/ui/Button';

const PRESETS: { style: Exclude<AvatarStyle, 'avataaars'>; label: string; seeds: string[] }[] = [
  { style: 'lorelei', label: 'Lorelei', seeds: ['luna', 'nova', 'comet'] },
  { style: 'adventurer', label: 'Adventurer', seeds: ['orbit', 'cosmo', 'aster'] },
  { style: 'pixel-art', label: 'Pixel art', seeds: ['pixel', 'glitch', 'bit'] },
  { style: 'bottts', label: 'Bottts', seeds: ['cyber', 'neon', 'droid'] },
];

interface AvatarPickerProps {
  account: Pick<User, 'id' | 'name' | 'gender' | 'avatarStyle' | 'avatarSeed'>;
  onSave: (style: AvatarStyle, seed: string) => Promise<void>;
}

export function AvatarPicker({ account, onSave }: AvatarPickerProps) {
  const initialStyle = account.avatarStyle && account.avatarStyle !== 'avataaars'
    ? account.avatarStyle
    : PRESETS[0].style;
  const [selection, setSelection] = useState({
    style: initialStyle,
    seed: account.avatarStyle === initialStyle && account.avatarSeed
      ? account.avatarSeed
      : `${account.id}-${initialStyle}-luna`,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const saveSelection = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await onSave(selection.style, selection.seed);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save your avatar. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-[#DDD1BD] bg-[#FFFCF5] p-5 shadow-[0_10px_20px_rgba(51,44,37,0.08)] sm:p-6" aria-labelledby="avatar-picker-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Y2KAvatar
            account={account}
            gender={account.gender ?? 'neutral'}
            style={selection.style}
            seed={selection.seed}
            size="xl"
            className="!h-20 !w-20"
          />
          <h2 id="avatar-picker-title" className="text-xl font-black text-[#332C25]">
            Choose your avatar
          </h2>
        </div>
        <Button
          type="button"
          onClick={saveSelection}
          loading={saving}
          className="!rounded-full !border-[#79563F] !bg-[#79563F] !text-[#FFFCF5] !shadow-[0_4px_0_#634430] hover:!bg-[#634430] hover:!text-[#FFFCF5] focus-visible:!ring-[#79563F]"
        >
          Save avatar
        </Button>
      </div>

      {saveError && <p className="mt-4 text-sm font-medium text-red-700" role="alert">{saveError}</p>}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="Preset generated avatars">
        {PRESETS.flatMap(preset => preset.seeds.map(presetSeed => {
          const seed = `${account.id}-${preset.style}-${presetSeed}`;
          const isSelected = selection.style === preset.style && selection.seed === seed;

          return (
            <button
              key={`${preset.style}-${presetSeed}`}
              type="button"
              aria-label={`${preset.label} avatar preset ${presetSeed}`}
              aria-pressed={isSelected}
              onClick={() => setSelection({ style: preset.style, seed })}
              className={`group flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border p-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#79563F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFCF5]
                ${isSelected
                  ? 'border-[#79563F] bg-[#EFE2CE] shadow-[0_0_0_1px_rgba(121,86,63,0.18),0_6px_10px_rgba(51,44,37,0.08)]'
                  : 'border-[#DDD1BD] bg-[#F6F0E4] hover:-translate-y-0.5 hover:bg-[#F0E7D9] hover:shadow-[0_6px_12px_rgba(51,44,37,0.08)]'}`}
            >
              <span className="relative">
                <Y2KAvatar account={account} gender={account.gender ?? 'neutral'} style={preset.style} seed={seed} size="lg" />
                {isSelected && (
                  <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#79563F] text-[#FFFCF5] shadow-[0_2px_0_rgba(51,44,37,0.2)]" aria-hidden="true">
                    <Check size={12} />
                  </span>
                )}
              </span>
              <span className="text-xs font-bold text-[#332C25]">{preset.label}</span>
            </button>
          );
        }))}
      </div>
    </section>
  );
}
