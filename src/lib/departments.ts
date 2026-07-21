// Bougie's real 130-service catalog groups into five departments (see
// settings.aboutBadgeLabel: "5 Service Departments — Hair, Wigs, Lash, Spa
// & Nails") even though the underlying category strings are much more
// granular (a dozen distinct "Nails — ..." categories, four braid styles,
// etc). Shared by the homepage services teaser, the category icon lookup,
// and the booking flow's department tabs so all three stay in sync.
export type Department = { name: string; match: RegExp };

export const DEPARTMENTS: Department[] = [
  { name: "Hair & Braids", match: /braid|twist|corn\s*row|hair extension/i },
  { name: "Wigs & Frontals", match: /wig|frontal/i },
  { name: "Lash Extensions", match: /lash/i },
  { name: "Spa", match: /spa/i },
  { name: "Nails", match: /nail/i },
];

// Categories that don't match any department (e.g. "Extras & Add-ons")
// fall into this catch-all so they're still reachable, just grouped last.
export const OTHER_DEPARTMENT: Department = { name: "Extras", match: /.*/ };

export function getDepartmentForCategory(category: string): Department {
  return DEPARTMENTS.find((d) => d.match.test(category)) || OTHER_DEPARTMENT;
}
