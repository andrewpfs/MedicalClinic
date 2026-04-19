import { useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { useStaffAuth } from '../../hooks/useStaffAuth';

export default function ReportTable({ type = 'RepDAR', data = [], title = 'Report' }) {
  useStaffAuth('Admin');

  const columns = useMemo(() => {
    if (type === 'RepDAR') {
      return [
        {
          name: 'Name',
          selector: (row) => `${row.FirstName} ${row.LastName}`,
          sortable: true,
        },
        {
          name: 'Department',
          selector: (row) => row.DepartmentName,
          sortable: true,
        },
        {
          name: 'Total Appointments',
          selector: (row) => row.Appointments,
          sortable: true,
        },
      ];
    }

    if (type === 'RepGAR') {
      return [
        {
          name: 'Department',
          selector: (row) => row.DepartmentName,
          sortable: true,
        },
        {
          name: 'Total Appointments',
          selector: (row) => row.Appointments,
          sortable: true,
        },
      ];
    }

    return [
      {
        name: 'Department',
        selector: (row) => row.DepartmentName,
        sortable: true,
      },
      {
        name: 'Revenue',
        selector: (row) => row.Revenue,
        sortable: true,
      },
    ];
  }, [type]);

  return (
    <div className="report-table">
      <DataTable
        title={title}
        columns={columns}
        data={data}
        fixedHeader
        highlightOnHover
        pagination
      />
    </div>
  );
}
