"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { updateInquiryStatusMutation } from "@/app/admin/actions";
import { useAdminToast } from "./AdminToast";

export type InquiryRow = Record<string, string | number | boolean | null> & { id:number;inquiry_reference:string;company_name:string;contact_person:string;business_email:string;country:string;status:string;created_at:string };

export function InquiryTable({ inquiries, type, statusOptions, queryKey }: { inquiries:InquiryRow[];type:"rfq"|"sample";statusOptions:string[];queryKey:string }) {
  const client = useQueryClient();
  const { notify } = useAdminToast();
  const key = ["admin-inquiries", queryKey];
  const { data = inquiries } = useQuery({ queryKey:key, queryFn:async()=>inquiries, initialData:inquiries, staleTime:Infinity });
  const mutation = useMutation({
    mutationFn:updateInquiryStatusMutation,
    onMutate:async ({ id, status }) => {
      await client.cancelQueries({ queryKey:key });
      const previous = client.getQueryData<InquiryRow[]>(key) ?? [];
      client.setQueryData<InquiryRow[]>(key, (current=[])=>current.map((row)=>String(row.id) === id ? { ...row, status } : row));
      return { previous };
    },
    onError:(error, _variables, context)=>{ client.setQueryData(key, context?.previous ?? inquiries); notify("error", error instanceof Error ? error.message : "Status gagal diperbarui."); },
    onSuccess:()=>notify("success", "Status permintaan buyer berhasil diperbarui."),
  });
  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Buyer</th><th>Country</th><th>Requirement</th><th>Submitted</th><th>Status</th></tr></thead><tbody>{data.map((item)=><tr key={item.id}><td><strong>{item.company_name}</strong><small>{item.contact_person} · {item.business_email}</small></td><td>{item.country}</td><td><strong>{String(type === "rfq" ? item.product_interested : item.product)}</strong><small>{String(type === "rfq" ? item.quantity_required : item.expected_future_order_volume)}</small></td><td>{new Date(item.created_at).toLocaleDateString("en-GB")}<small>{item.inquiry_reference}</small></td><td><div className="admin-inline-form"><select aria-label={`Status ${item.inquiry_reference}`} value={item.status} disabled={mutation.isPending && mutation.variables.id === String(item.id)} onChange={(event)=>mutation.mutate({type,id:String(item.id),status:event.target.value})}>{statusOptions.map((status)=><option key={status}>{status}</option>)}</select>{mutation.isPending && mutation.variables.id === String(item.id) && <LoaderCircle className="admin-spin" size={14}/>}</div></td></tr>)}</tbody></table></div>;
}
