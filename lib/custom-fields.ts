/**
 * Custom field definitions live in code today; an admin UI for managing
 * them is a future enhancement. Field *values* are persisted on the
 * organization record under the `custom_fields` blob.
 */

export type CustomFieldType = 'text' | 'number' | 'select' | 'boolean' | 'date';

export interface CustomFieldDef {
  /** Stable key used to look up the value on `Organization.custom_fields`. */
  key: string;
  /** Display label */
  label: string;
  /** Optional helper text shown below the input */
  hint?: string;
  type: CustomFieldType;
  /** Only applies when type === 'select' */
  options?: string[];
  /** Only applies to top-level UI grouping; defaults to 'General' */
  group?: 'General' | 'Compliance' | 'Advocacy' | 'Operations';
  /** When true, surfaces a small star indicator next to the value */
  pin?: boolean;
}

/**
 * Default ALTA-relevant custom field set. Spans every supported type so the
 * Member360 panel + form drawer code paths exercise them all.
 */
export const DEFAULT_CUSTOM_FIELD_DEFS: CustomFieldDef[] = [
  { key: 'license_number',     label: 'State license #',    type: 'text',    group: 'Compliance', hint: 'Title insurance / agent license, if applicable', pin: true },
  { key: 'license_state',      label: 'License state',      type: 'text',    group: 'Compliance' },
  { key: 'license_expires',    label: 'License expires',    type: 'date',    group: 'Compliance' },
  { key: 'tipac_level',        label: 'TIPAC contribution', type: 'select',  group: 'Advocacy', options: ['None', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Chairman\'s Circle'], pin: true },
  { key: 'board_seat_number',  label: 'Board seat #',       type: 'number',  group: 'Advocacy', hint: 'Numbered seat for ACU underwriter board members' },
  { key: 'best_practices_certified', label: 'BP certified', type: 'boolean', group: 'Compliance', hint: 'ALTA Best Practices Framework certified' },
];

/**
 * Returns the canonical definitions list. Centralized so future loading
 * (DB / admin UI) can swap the implementation without touching consumers.
 */
export function getCustomFieldDefs(): CustomFieldDef[] {
  return DEFAULT_CUSTOM_FIELD_DEFS;
}

/** Coerces a raw value to the type expected by the definition. */
export function coerceCustomFieldValue(
  def: CustomFieldDef,
  raw: unknown,
): string | number | boolean | null {
  if (raw === null || raw === undefined || raw === '') return null;
  switch (def.type) {
    case 'number': {
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    }
    case 'boolean':
      if (typeof raw === 'boolean') return raw;
      return raw === 'true' || raw === '1' || raw === 1 || raw === 'yes';
    case 'select':
      if (typeof raw !== 'string') return null;
      return def.options?.includes(raw) ? raw : null;
    case 'date':
      if (typeof raw !== 'string') return null;
      // Accept YYYY-MM-DD only
      return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
    default:
      return String(raw);
  }
}

/** Format a value for human display. */
export function formatCustomFieldValue(
  def: CustomFieldDef,
  value: unknown,
): string {
  if (value === null || value === undefined || value === '') return '—';
  if (def.type === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}
