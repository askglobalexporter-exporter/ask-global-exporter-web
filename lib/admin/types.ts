export type AdminRole = "super_admin" | "marketing" | "content_editor";

export type AdminProfile = {
  user_id: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminPermission =
  | "dashboard.read" | "analytics.read" | "inquiries.read" | "inquiries.write"
  | "content.read" | "content.write" | "products.read" | "products.write"
  | "homepage.write" | "testimonials.write" | "blog.write" | "seo.write"
  | "media.read" | "media.write" | "team.write";

const rolePermissions: Record<AdminRole, AdminPermission[]> = {
  super_admin: ["dashboard.read","analytics.read","inquiries.read","inquiries.write","content.read","content.write","products.read","products.write","homepage.write","testimonials.write","blog.write","seo.write","media.read","media.write","team.write"],
  marketing: ["dashboard.read","analytics.read","inquiries.read","inquiries.write","content.read","testimonials.write","blog.write","seo.write","media.read","media.write"],
  content_editor: ["dashboard.read","content.read","content.write","products.read","products.write","homepage.write","seo.write","media.read","media.write"],
};

export function roleCan(role: AdminRole, permission: AdminPermission) {
  return rolePermissions[role].includes(permission);
}

export function roleLabel(role: AdminRole) {
  return { super_admin: "Super Admin", marketing: "Marketing", content_editor: "Content Editor" }[role];
}
