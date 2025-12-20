import { useEffect, useMemo, useState } from "react";
import { Card, Table, message } from "antd";
import { getAuditLogs } from "../api-service/log-service";

const formatTime = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
};

function AllLogs() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);

  const load = async (nextPage = page, nextPageSize = pageSize) => {
    try {
      setLoading(true);
      const res = await getAuditLogs({ page: nextPage, limit: nextPageSize });
      setRows(Array.isArray(res?.data) ? res.data : []);
      setTotal(Number(res?.meta?.total) || 0);
    } catch (e) {
      message.error(e?.response?.data?.message || "Failed to load logs");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = useMemo(
    () => [
      {
        title: "Time",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (v) => formatTime(v),
        width: 190,
      },
      {
        title: "Admin",
        key: "actor",
        render: (_, r) => r?.actorEmail || r?.actorName || "",
        ellipsis: true,
      },
      {
        title: "Method",
        dataIndex: "method",
        key: "method",
        width: 90,
      },
      {
        title: "Path",
        dataIndex: "path",
        key: "path",
        ellipsis: true,
      },
      {
        title: "Status",
        dataIndex: "statusCode",
        key: "statusCode",
        width: 90,
      },
      {
        title: "IP",
        dataIndex: "ip",
        key: "ip",
        width: 140,
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Performance Logs</h1>
        <p className="text-gray-500 text-sm mt-1">Admin actions (write requests)</p>
      </div>

      <Card className="shadow-sm border border-gray-100" bodyStyle={{ padding: 0 }}>
        <Table
          rowKey={(r) => r?._id}
          loading={loading}
          columns={columns}
          dataSource={rows}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
          }}
          onChange={(pagination) => {
            const nextPage = pagination?.current || 1;
            const nextSize = pagination?.pageSize || 25;
            setPage(nextPage);
            setPageSize(nextSize);
            load(nextPage, nextSize);
          }}
        />
      </Card>
    </div>
  );
}

export default AllLogs;