import { ICONS } from '../../lib/icons';
import type { IconName } from '../../lib/icons';

export default function Icon({ name }: { name: IconName }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={ICONS[name]} />
        </svg>
    );
}
