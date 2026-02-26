const DataTable = ({ columns, data }) => {
  return (
    <table className="min-w-full bg-white rounded-lg shadow">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.accessor} className="p-3 text-left">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index} className="border-t">
            {columns.map((col) => (
              <td key={col.accessor} className="p-3">
                {row[col.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
