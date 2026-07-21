import { ShieldCheck, UserPlus } from "lucide-react";
import { inviteAdminAction, updateAdminRoleAction } from "@/app/admin/actions";
import { AdminMemberActions } from "@/components/admin/AdminMemberActions";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminActionForm } from "@/components/admin/AdminActionForm";
import { requireAdmin } from "@/lib/admin/auth";
import { roleDescription, roleLabel, type AdminRole } from "@/lib/admin/types";

export const metadata = { title:"Tim & Akses" };
type Profile = { user_id:string;full_name:string;role:AdminRole;is_active:boolean;last_seen_at:string|null;created_at:string };
const roles:AdminRole[] = ["super_admin","marketing","content_editor"];
const PAGE_SIZE = 12;

export default async function TeamPage({ searchParams }: { searchParams:Promise<{page?:string}> }) {
  const { user, supabase } = await requireAdmin("team.write");
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await supabase.from("admin_profiles").select("user_id,full_name,role,is_active,last_seen_at,created_at", { count:"exact" }).order("created_at", { ascending:false }).range(from, from + PAGE_SIZE - 1);
  const profiles = (data ?? []) as Profile[];
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return <>
    <div className="admin-page-head"><div><h1>Tim & akses</h1><p>{count ?? 0} administrator · hak akses setiap role diterapkan di server dan database.</p></div></div>
    <div className="admin-split">
      <article className="admin-card">
        <div className="admin-card-head"><div><h2><UserPlus size={14}/> Undang administrator</h2><p>Email aman akan dikirim untuk membuat password pertama.</p></div></div>
        <AdminActionForm action={inviteAdminAction} successMessage="Undangan administrator berhasil dikirim." pendingMessage="Mengirim undangan…" className="admin-form">
          <label><span>Nama lengkap</span><input name="full_name" required/></label>
          <label><span>Alamat email</span><input name="email" type="email" required/></label>
          <label><span>Role</span><select name="role" defaultValue="content_editor">{roles.map((role)=><option value={role} key={role}>{roleLabel(role)}</option>)}</select><small>Role dapat diubah kembali setelah akun dibuat.</small></label>
          <div className="admin-form-actions"><button className="admin-primary-button">Kirim undangan</button></div>
        </AdminActionForm>
        <div className="admin-role-guide">{roles.map((role)=><div key={role}><b>{roleLabel(role)}</b><p>{roleDescription(role)}</p></div>)}</div>
        <div className="admin-security-note" style={{marginTop:18,background:"#edf5f1",color:"#315e4a"}}><ShieldCheck size={18}/><span><b style={{color:"#214a39"}}>Role dijaga oleh database</b><small>Izin diperiksa di server dan melalui RLS.</small></span></div>
      </article>
      <section>
        {profiles.map((profile)=><article className="admin-list-card" key={profile.user_id}><div className="admin-list-card-body">
          <div className="admin-card-head"><div><h2>{profile.full_name}{profile.user_id === user.id ? " (Anda)" : ""}</h2><p>{profile.last_seen_at ? `Terakhir aktif ${new Date(profile.last_seen_at).toLocaleString("id-ID")}` : "Undangan tertunda atau belum pernah login"}</p></div><span className={`admin-badge ${profile.is_active ? "published" : "closed"}`}>{profile.is_active ? "Aktif" : "Nonaktif"}</span></div>
          <AdminActionForm action={updateAdminRoleAction} successMessage="Akses administrator berhasil diperbarui." className="admin-form">
            <input type="hidden" name="user_id" value={profile.user_id}/>
            <div className="admin-form-grid"><label><span>Role</span><select name="role" defaultValue={profile.role}>{roles.map((role)=><option value={role} key={role}>{roleLabel(role)}</option>)}</select><small>{roleDescription(profile.role)}</small></label><label className="admin-check" style={{alignSelf:"center"}}><input type="checkbox" name="is_active" defaultChecked={profile.is_active}/><span>Akun aktif</span></label></div>
            <div className="admin-form-actions"><button className="admin-secondary-button">Simpan akses</button></div>
          </AdminActionForm>
          <AdminMemberActions userId={profile.user_id} fullName={profile.full_name} isCurrentUser={profile.user_id === user.id}/>
        </div></article>)}
        <AdminPagination basePath="/admin/team" page={page} pageCount={pageCount}/>
      </section>
    </div>
  </>;
}
