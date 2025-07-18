import React, { useState } from "react";
import { Modal, Upload, Button, message, Table, Alert, Checkbox } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { importTeacherFromExcel } from "../../../services/api.service";
import * as XLSX from "xlsx";

const { Dragger } = Upload;

const ImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [fileList, setFileList] = useState([]);
  const [sheetHeaders, setSheetHeaders] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // 1) Khi chọn file: parse header row
  // 1) Khi chọn file: parse header row
  const beforeUpload = async (file) => {
    // Kiểm tra extension file
    const isExcel = /\.(xlsx|xls)$/i.test(file.name);
    if (!isExcel) {
      message.error("Chỉ chấp nhận file Excel (.xlsx, .xls)");
      return Upload.LIST_IGNORE;
    }

    // Kiểm tra MIME type (tùy chọn thêm)
    const isValidMimeType = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ].includes(file.type);

    if (!isValidMimeType) {
      message.error("File không đúng định dạng Excel");
      return Upload.LIST_IGNORE;
    }

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const headers = rows[0] || [];
      setSheetHeaders(headers);
      setSelectedColumns([]); // reset chọn cột
      setFileList([file]);
      return false; // ngăn ant-upload tự upload
    } catch (error) {
      message.error("Không thể đọc file Excel. Vui lòng kiểm tra lại file");
      return Upload.LIST_IGNORE;
    }
  };

  // 2) Khi bấm Import: build workbook mới chỉ với các cột đã chọn
  const handleImport = async () => {
    if (!fileList.length) {
      message.error("Vui lòng chọn file");
      return;
    }
    if (!selectedColumns.length) {
      message.error("Vui lòng chọn tối thiểu một cột");
      return;
    }

    setUploading(true);
    setImportResult(null);

    try {
      const file = fileList[0];
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const headers = rows[0] || [];

      // tìm index các cột được chọn
      const indices = selectedColumns
        .map((col) => headers.indexOf(col))
        .filter((i) => i >= 0);

      // xây dựng mảng 2D: hàng đầu là header, tiếp theo là data
      const newRows = [
        selectedColumns,
        ...rows.slice(1).map((r) => indices.map((i) => r[i] ?? "")),
      ];

      // build workbook & blob
      const newWs = XLSX.utils.aoa_to_sheet(newRows);
      const newWb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWb, newWs, "Import");
      const arr = XLSX.write(newWb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([arr], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Debug: kiểm tra blob
      console.log("Blob created:", blob);
      console.log("Blob size:", blob.size);

      // gửi lên API
      const fd = new FormData();
      fd.append("excel", blob, "import.xlsx");

      // Debug: kiểm tra FormData
      console.log("FormData created:", fd);
      console.log("FormData entries:", Array.from(fd.entries()));

      console.log("Calling API...");
      const response = await importTeacherFromExcel(fd);
      console.log("API response:", response);

      const { errorCode, message: msg, data: result } = response || {};
      setImportResult(result);

      if (errorCode === 0 && result?.failed === 0) {
        message.success(msg || "Import thành công");
        onSuccess();
      } else if (result?.imported > 0) {
        message.warning(
          `Import hoàn tất: ${result.imported} thành công, ${result.failed} lỗi`
        );
        onSuccess();
      } else {
        message.error(msg || "Import thất bại hoàn toàn");
      }
    } catch (err) {
      console.error("Error during import:", err);
      message.error("Có lỗi xảy ra khi import file");
    } finally {
      setUploading(false);
    }
  };

  // Hàm reset tất cả state
  const resetModal = () => {
    setFileList([]);
    setSheetHeaders([]);
    setSelectedColumns([]);
    setImportResult(null);
    setUploading(false);
  };

  // Hàm đóng modal và reset
  const handleClose = () => {
    resetModal();
    onClose();
  };

  const uploadProps = {
    name: "excel",
    multiple: false,
    fileList,
    accept: ".xlsx,.xls",
    beforeUpload,
    onRemove: () => {
      resetModal();
    },
  };

  return (
    <Modal
      title="Import danh sách giảng viên"
      open={isOpen}
      onCancel={handleClose}
      footer={[
        <Button key="close" onClick={handleClose}>
          Đóng
        </Button>,
      ]}
      width={800}
    >
      <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Kéo thả file Excel hoặc click để chọn</p>
      </Dragger>

      {/* Phần chọn cột chỉ hiện khi đã parse header xong và chưa show kết quả */}
      {sheetHeaders.length > 0 && !importResult && (
        <div style={{ marginBottom: 16 }}>
          <p>Chọn cột muốn import:</p>
          <Checkbox.Group
            options={sheetHeaders.map((h) => ({ label: h, value: h }))}
            value={selectedColumns}
            onChange={setSelectedColumns}
          />
          <Button
            type="primary"
            disabled={uploading || !selectedColumns.length}
            onClick={handleImport}
            style={{ marginTop: 8 }}
          >
            Import
          </Button>
        </div>
      )}

      {uploading && <Alert message="Đang xử lý file..." type="info" showIcon />}

      {importResult && (
        <div style={{ marginTop: 16 }}>
          <Alert
            message={`Kết quả import: ${importResult.imported} thành công, ${importResult.failed} lỗi`}
            type={importResult.failed > 0 ? "warning" : "success"}
            showIcon
            style={{ marginBottom: 16 }}
          />
          {/* ...render Table kết quả như trước... */}
        </div>
      )}
    </Modal>
  );
};

export default ImportModal;
