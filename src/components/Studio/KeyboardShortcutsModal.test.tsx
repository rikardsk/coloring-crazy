import { describe, it, expect } from 'vitest';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';

describe('KeyboardShortcutsModal', () => {
  it('exports valid component definition', () => {
    expect(KeyboardShortcutsModal).toBeDefined();
    expect(typeof KeyboardShortcutsModal).toBe('function');
  });
});
