import type { AvatarGender, AvatarStyle, User } from '@/types';

const sizes = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

interface Y2KAvatarProps {
  account: Pick<User, 'id' | 'name' | 'avatarStyle' | 'avatarSeed'>;
  gender?: AvatarGender;
  style?: AvatarStyle;
  seed?: string;
  size?: keyof typeof sizes;
  className?: string;
}

const genderOptions: Record<AvatarGender, Record<string, string>> = {
  female: {
    topVariant: 'bigHair,bob,bun,curly,curvy,dreads,dreads01,dreads02,frida,frizzle,fro,froBand,longButNotTooLong,miaWallace,shavedSides,straight01,straight02,straightAndStrand',
    topProbability: '100',
    facialHairProbability: '0',
  },
  male: {
    topVariant: 'shortCurly,shortFlat,shortRound,shortWaved,sides,theCaesar,theCaesarAndSidePart,shaggy,shaggyMullet',
    topProbability: '100',
    facialHairVariant: 'beardLight,beardMajestic,beardMedium,moustacheFancy,moustacheMagnum',
    facialHairProbability: '60',
  },
  neutral: {},
};

export function Y2KAvatar({ account, gender = 'neutral', style, seed, size = 'md', className = '' }: Y2KAvatarProps) {
  const avatarStyle = style ?? account.avatarStyle ?? 'avataaars';
  const avatarSeed = seed ?? account.avatarSeed ?? account.id;
  const params = new URLSearchParams({ seed: avatarSeed });
  if (avatarStyle === 'avataaars') {
    Object.entries(genderOptions[gender]).forEach(([key, value]) => params.set(key, value));
  }
  const avatarUrl = `https://api.dicebear.com/10.x/${avatarStyle}/svg?${params.toString()}`;

  return (
    <img
      src={avatarUrl}
      alt={`${account.name}'s generated avatar`}
      className={`${sizes[size]} shrink-0 rounded-full border-2 border-[#DDD1BD] bg-[#FFFCF5] object-cover shadow-[0_2px_8px_rgba(51,44,37,0.12)] ${className}`}
      loading="lazy"
    />
  );
}
