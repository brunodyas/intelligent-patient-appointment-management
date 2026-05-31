import { formatDateForFranchiseUser }  from "@/utils/formatDate";

export const renderNotes = (note: any) => (
  <p className="text-[#000000f2] flex-shrink-0 text-sm">
    {formatDateForFranchiseUser(note?.createdAt || note?.created_at)} - {note?.note}
  </p>
);
