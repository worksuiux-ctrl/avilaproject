import { useState } from "react";
import { Dialog, Button, FileUploader, ProgressBar, Alert } from "@coe/design-system";

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
  interfaceName: string;
  formato: string;
}

export function FileUploadModal({ open, onClose, interfaceName, formato }: FileUploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const handleFilesSelected = (selected: File[]) => {
    setFiles(selected);
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setUploading(false);
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            setFiles([]);
            setProgress(0);
            onClose();
          }, 2000);
          return 100;
        }
        return p + 10;
      });
    }, 300);
  };

  const handleClose = () => {
    if (uploading) return;
    setFiles([]);
    setProgress(0);
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} title={`Cargar archivo - ${interfaceName}`} size="md">
      <div className="space-y-4">
        <p className="text-[12px] text-text-grey">
          Formato requerido: <span className="font-medium text-text-darkgrey">{formato}</span>
        </p>

        {!success && (
          <FileUploader
            accept={formato}
            onFilesSelected={handleFilesSelected}
          />
        )}

        {files.length > 0 && !success && (
          <div className="space-y-1">
            {files.map((f, i) => (
              <p key={i} className="text-[12px] text-text-darkgrey">{f.name}</p>
            ))}
          </div>
        )}

        {uploading && (
          <ProgressBar value={progress} variant="info" size="sm" showLabel />
        )}

        {success && (
          <Alert variant="success" message="Archivo cargado exitosamente." />
        )}
      </div>

      {!success && (
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleUpload} disabled={files.length === 0 || uploading}>
            Subir archivo
          </Button>
        </div>
      )}
    </Dialog>
  );
}
