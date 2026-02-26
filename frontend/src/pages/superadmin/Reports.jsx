import DateRangeFilter from "../../components/common/DateRangeFilter";
import { downloadReport } from "../../services/reportService";

export default function Reports() {
  const handleDownload = (start, end) => {
    downloadReport(start, end);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <DateRangeFilter onFilter={handleDownload} />
    </div>
  );
}
