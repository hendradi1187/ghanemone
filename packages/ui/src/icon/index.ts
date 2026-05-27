export { Icon, type IconProps } from './Icon';
export { iconMap, isIconName, type IconName } from './icon-map';

// Re-export iconPaths as a deprecated compatibility shim — consumers that
// reference `iconPaths` directly will still compile. The object now mirrors
// the keys of iconMap (the values are Lucide components, not SVG path strings).
// Callers should migrate to `iconMap` or just use `<Icon name="…" />`.
/** @deprecated Use `iconMap` or `<Icon name="…" />` instead. */
export { iconMap as iconPaths } from './icon-map';
