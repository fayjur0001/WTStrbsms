export const roles = ["general", "super admin", "admin", "support"] as const;

type Role = (typeof roles)[number];

export default Role;
