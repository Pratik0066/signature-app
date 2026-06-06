export function RecentDocuments() {
  const docs = [
    {
      name: "Employment Contract",
      status: "Signed",
    },
    {
      name: "NDA Agreement",
      status: "Pending",
    },
    {
      name: "Freelance Proposal",
      status: "Rejected",
    },
  ];

  return (
    <div className="bg-[#12121A] rounded-2xl border border-white/10 p-5">
      <h3 className="font-semibold mb-5">
        Recent Documents
      </h3>

      <div className="space-y-4">
        {docs.map((doc) => (
          <div
            key={doc.name}
            className="
              flex
              justify-between
              items-center
              border-b
              border-white/5
              pb-4
            "
          >
            <span>{doc.name}</span>

            <span className="text-sm text-zinc-400">
              {doc.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}