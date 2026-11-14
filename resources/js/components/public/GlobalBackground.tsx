import type { PublicImage } from '../../types';

export default function GlobalBackground({ image }: { image: PublicImage | null }) {
    if (!image) {
        return null;
    }

    return (
        <div className="site-background" aria-hidden="true">
            <img src={image.url} alt="" />
        </div>
    );
}
