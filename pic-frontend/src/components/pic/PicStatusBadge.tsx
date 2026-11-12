import type { PicStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';

const config: Record<PicStatus, { label: string; color: 'green' | 'red' | 'gray' | 'yellow' }> = {
  active: { label: 'Active', color: 'green' },
  full: { label: 'Full', color: 'red' },
  deactivated: { label: 'Deactivated', color: 'gray' },
  passed: { label: 'Passed', color: 'yellow' },
};

export function PicStatusBadge({ status }: { status: PicStatus }) {
  const { label, color } = config[status];
  return <Badge label={label} color={color} dot />;
}
