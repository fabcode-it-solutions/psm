import React, { useState, useRef } from "react";
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from "lucide-react";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import DashboardButton from "@/component/ui/dashboard/DashboardButton";
import { useApiRequest } from "@/hooks/useApiRequest";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/libs/redux/store";
import { setloading } from "@/libs/redux/slices/dashboardSlice";

interface BulkUploadResult {
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  duplicateCount: number;
  errors: Array<{
    row: number;
    name: string;
    error: string;
  }>;
  duplicates: Array<{
    row: number;
    name: string;
  }>;
}

interface BulkUploadTypesProps {
  loadTypes: () => void;
}

const BulkUploadTypes: React.FC<BulkUploadTypesProps> = ({ loadTypes }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loading = useSelector((state: RootState) => state.dashboard.loading);
  const dispatch = useDispatch();
  const setLoading = (s: string | boolean) => {
    dispatch(setloading(s));
  };

  const { request: uploadBulkTypes } = useApiRequest();

  const handleFileSelect = (file: File) => {
    if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith('.csv')) {
      toast.error("Please select a CSV file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/cars/types/bulk-upload?template=true');
      
      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'types_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Template downloaded successfully");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    try {
      setLoading("Uploading types...");
      
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/admin/cars/types/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadResult(result.data);
        loadTypes();
        toast.success(result.message);
      } else {
        if (result.data) {
          setUploadResult(result.data);
        }
        toast.error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setShowModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <DashboardButton
        buttonText="Bulk Upload"
        onClick={() => setShowModal(true)}
        icon={<Upload className="w-4 h-4" />}
      />

      <DialogPopup
        heading="Bulk Upload Types"
        open={showModal}
        setShowCreateModal={resetModal}
      >
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-blue-400 font-medium mb-2 font-sofia-sans">
              Instructions:
            </h4>
            <ul className="text-sm text-blue-300 space-y-1 font-sofia-sans">
              <li>• Upload a CSV file with type data</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Maximum 1000 types per upload</li>
              <li>• Required columns: name, modelId</li>
              <li>• Optional columns: description, status</li>              
            </ul>
          </div>

          {/* Download Template */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-4 font-sofia-sans">
              Need a template?
            </span>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-accent-100 hover:text-accent-100/80 text-sm font-sofia-sans"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? "border-accent-100 bg-accent-100/10"
                : "border-gray-5/20 hover:border-gray-5/40"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-gray-5/20 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-4" />
              </div>
              
              {selectedFile ? (
                <div className="space-y-2">
                  <p className="text-light-100 font-medium font-sofia-sans">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-4 font-sofia-sans">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="text-red-400 hover:text-red-300 text-sm font-sofia-sans"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-light-100 font-sofia-sans">
                    Click to select or drag and drop CSV file
                  </p>
                  <p className="text-sm text-gray-4 font-sofia-sans">
                    CSV files up to 5MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Results */}
          {uploadResult && (
            <div className="space-y-4">
              <h4 className="text-light-100 font-medium font-sofia-sans">
                Upload Results
              </h4>
              
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-5/10 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-light-100 font-sofia-sans">
                    {uploadResult.totalProcessed}
                  </div>
                  <div className="text-xs text-gray-4 font-sofia-sans">
                    Total Processed
                  </div>
                </div>
                
                <div className="bg-green-500/10 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-400 font-sofia-sans">
                    {uploadResult.successCount}
                  </div>
                  <div className="text-xs text-gray-4 font-sofia-sans">
                    Success
                  </div>
                </div>
                
                <div className="bg-red-500/10 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-red-400 font-sofia-sans">
                    {uploadResult.failedCount}
                  </div>
                  <div className="text-xs text-gray-4 font-sofia-sans">
                    Failed
                  </div>
                </div>
                
                <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-yellow-400 font-sofia-sans">
                    {uploadResult.duplicateCount}
                  </div>
                  <div className="text-xs text-gray-4 font-sofia-sans">
                    Duplicates
                  </div>
                </div>
              </div>

              {/* Errors */}
              {uploadResult.errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <h5 className="text-red-400 font-medium mb-2 font-sofia-sans flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Errors ({uploadResult.errors.length})
                  </h5>
                  <div className="space-y-1">
                    {uploadResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-300 font-sofia-sans">
                        Row {error.row}: {error.name} - {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Duplicates */}
              {uploadResult.duplicates.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <h5 className="text-yellow-400 font-medium mb-2 font-sofia-sans flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Duplicates ({uploadResult.duplicates.length})
                  </h5>
                  <div className="space-y-1">
                    {uploadResult.duplicates.map((duplicate, index) => (
                      <div key={index} className="text-sm text-yellow-300 font-sofia-sans">
                        Row {duplicate.row}: {duplicate.name} - Type already exists
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={resetModal}
              className="px-4 py-2 border border-gray-5/20 rounded text-light-100 hover:bg-gray-5/10 font-sofia-sans"
            >
              {uploadResult ? "Close" : "Cancel"}
            </button>
            
            {!uploadResult && (
              <button
                onClick={handleUpload}
                disabled={!selectedFile || (typeof loading === "string" ? loading !== "" : loading)}
                className="px-4 py-2 bg-accent-100 text-dark-100 rounded hover:bg-accent-100/90 disabled:opacity-50 font-sofia-sans font-medium flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {loading ? "Uploading..." : "Upload Types"}
              </button>
            )}
          </div>
        </div>
      </DialogPopup>
    </>
  );
};

export default BulkUploadTypes;