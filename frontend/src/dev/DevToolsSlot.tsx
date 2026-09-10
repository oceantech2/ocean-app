/**
 * Slot de ferramentas DEV.
 * Prefere `DevWipeButton.tsx` (gitignored); se ausente, usa o example versionado.
 */
import { ComponentType } from 'react';

type Mod = { default: ComponentType };

const localMods = import.meta.glob('./DevWipeButton.tsx', { eager: true }) as Record<string, Mod>;
const exampleMods = import.meta.glob('./DevWipeButton.example.tsx', {
  eager: true,
}) as Record<string, Mod>;

const DevWipeButton =
  Object.values(localMods)[0]?.default ?? Object.values(exampleMods)[0]?.default ?? null;

export default function DevToolsSlot() {
  if (!import.meta.env.DEV || !DevWipeButton) return null;
  const Button = DevWipeButton;
  return <Button />;
}
