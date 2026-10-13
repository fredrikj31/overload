import { useState } from "react";
import { cn } from "@shadcn-ui/lib/utils";
import { getMediaUrl } from "../../../utils/getMediaUrl";

type ExerciseGifProps = {
  imagePath: string;
  gifPath: string;
  alt: string;
};

/**
 * Shows the still image immediately and fades the animated GIF in on top
 * once it has loaded.
 */
export const ExerciseGif = ({ imagePath, gifPath, alt }: ExerciseGifProps) => {
  const [isGifLoaded, setIsGifLoaded] = useState<boolean>(false);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
      <img
        src={getMediaUrl(imagePath)}
        alt={alt}
        className="size-full object-cover"
      />
      <img
        src={getMediaUrl(gifPath)}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={() => setIsGifLoaded(true)}
        className={cn(
          "absolute inset-0 size-full object-cover transition-opacity duration-300",
          isGifLoaded ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
};
