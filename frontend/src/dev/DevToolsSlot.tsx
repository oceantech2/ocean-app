/**
 * Slot opcional de ferramentas locais de desenvolvimento.
 * Carrega `DevWipeButton.tsx` apenas se o arquivo existir (ele é gitignored).
 */
import { ComponentType } from 'react';

const modules = import.meta.glob('./DevWipeButton.tsx', { eager: true }) as Record<
  string,
  { default: ComponentType }
>;

const entries = Object.values(modules);
const DevWipeButton = entries[0]?.default ?? null;

export default function DevToolsSlot() {
  if (!import.meta.env.DEV || !DevWipeButton) return null;
  const Button = DevWipeButton;
  return <Button />;
}
