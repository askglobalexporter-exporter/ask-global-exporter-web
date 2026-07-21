import { ShieldCheck, UserPlus } from "lucide-react";
import { inviteAdminAction, updateAdminRoleAction } from "@/app/admin/actions";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { requireAdmin } from "@/lib/admin/auth";
import { roleLabel, type AdminRole } from "@/lib/admin/types";

export const metadata = { title:"Team & Roles" };
type Profile = { user_id:string;full_name:string;role:AdminRole;is_active:boolean;last_seen_at:string|null;created_at:string };
const roles:AdminRole[] = ["super_admin","marketing","content_editor"];
const PAGE_SIZE = 12;

export default async function TeamPage({ searchParams }: { searchParams:Promise<{page?:string}> }) {
  const { supabase } = await requireAdmin("team.write");
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await supabase.from("admin_profiles").select("user_id,full_name,role,is_active,last_seen_at,created_at", { count:"exact" }).order("created_at", { ascending:false }).range(from, from + PAGE_SIZE - 1);
  const profiles = (data ?? []) as Profile[];
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  return <><div className="admin-page-head"><div><h1>Team & role access</h1><p>{count ?? 0} administrator · 12 akun per halaman.</p></div></div><div className="admin-split"><article className="admin-card"><div className="admin-card-head"><div><h2><UserPlus size={14}/> Invite administrator</h2><p>Supabase sends a secure account activation email.</p></div></div><form action={inviteAdminAction} className="admin-form"><label><span>Full name</span><input name="full_name" required/></label><label><span>Email address</span><input name="email" type="email" required/></label><label><span>Role</span><select name="role" defaultValue="content_editor">{roles.map((role)=><option value={role} key={role}>{roleLabel(role)}</option>)}</select></label><div className="admin-form-actions"><button className="admin-primary-button">Send invitation</button></div></form><div className="admin-security-note" style={{marginTop:18,background:"#edf5f1",color:"#315e4a"}}><ShieldCheck size={18}/><span><b style={{color:"#214a39"}}>Database-enforced roles</b><small>Permissions are checked both server-side and through RLS.</small></span></div></article><section>{profiles.map((profile)=><article className="admin-list-card" key={profile.user_id}><div className="admin-list-card-body"><div className="admin-card-head"><div><h2>{profile.full_name}</h2><p>{profile.last_seen_at ? `Last active ${new Date(profile.last_seen_at).toLocaleString("en-GB")}` : "Invitation pending or never signed in"}</p></div><span className={`admin-badge ${profile.is_active ? "published" : "closed"}`}>{profile.is_active ? "Active" : "Inactive"}</span></div><form action={updateAdminRoleAction} className="admin-form"><input type="hidden" name="user_id" value={profile.user_id}/><div className="admin-form-grid"><label><span>Role</span><select name="role" defaultValue={profile.role}>{roles.map((role)=><option value={role} key={role}>{roleLabel(role)}</option>)}</select></label><label className="admin-check" style={{alignSelf:"end",paddingBottom:10}}><input type="checkbox" name="is_active" defaultChecked={profile.is_active}/><span>Account active</span></label></div><div className="admin-form-actions"><button className="admin-secondary-button">Update access</button></div></form></div></article>)}<AdminPagination basePath="/admin/team" page={page} pageCount={pageCount}/></section></div></>;
}
