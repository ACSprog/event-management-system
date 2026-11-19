import { Beef, Beer, Cookie, CupSoda, Drumstick, GlassWater, HardHat, Sandwich, Shirt, Soup, Utensils, type LucideIcon } from "lucide-react";
import { cx } from "@/components/ui";
import type { MenuArt, MenuItem } from "@/lib/event-day";

const icons: Record<MenuArt, LucideIcon> = { chicken: Drumstick, burger: Sandwich, beef: Beef, water: GlassWater, soda: CupSoda, beer: Beer, shirt: Shirt, cap: HardHat, soup: Soup, snack: Cookie };

/**
 * Picture for a menu item: the organiser's uploaded photo, or a placeholder
 * (icon on a coloured tile) until they upload one. Square, sized by className.
 */
export function MenuPicture({ item, className }: { item: Pick<MenuItem, "name" | "photo" | "art">; className?: string }) {
  if (item.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.photo} alt={item.name} className={cx("shrink-0 rounded-xl object-cover", className)} />;
  }
  const I = item.art ? icons[item.art.icon] : Utensils;
  return (
    <span role="img" aria-label={item.name} className={cx("flex shrink-0 items-center justify-center rounded-xl text-white", className)} style={{ background: `linear-gradient(135deg, ${item.art?.from ?? "#7B8496"}, ${item.art?.to ?? "#172033"})` }}>
      <I className="h-1/2 w-1/2" strokeWidth={1.6} />
    </span>
  );
}
