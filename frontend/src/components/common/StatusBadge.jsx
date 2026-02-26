const StatusBadge = ({ status }) => {
  const colors = {
    APPROVED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${colors[status]}`}>
      {status}
    </span>
  );
};
