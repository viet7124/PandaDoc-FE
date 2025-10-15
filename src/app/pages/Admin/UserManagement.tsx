import React from 'react';
import DataTable from '../../components/DataTable';

export default function UserManagement(): JSX.Element {
  return (
    <div className="p-6 ml-64 bg-gray-50 min-h-screen">
      <DataTable 
        title="Danh sách người dùng"
        searchPlaceholder="Tất cả"
      />
    </div>
  );
}
