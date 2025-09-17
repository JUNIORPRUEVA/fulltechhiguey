// client/src/components/ObjectUploader.tsx
import { useMemo, useState, useEffect } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import AwsS3 from "@uppy/aws-s3";
import type { UppyFile } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onComplete?: (fileUrls: string[]) => void;
  onPreview?: (previewUrl: string) => void; // ✅ NUEVO: callback para preview instantáneo
  buttonClassName?: string;
  children: React.ReactNode;
}

export function ObjectUploader({
  maxNumberOfFiles = 50,
  maxFileSize = 50 * 1024 * 1024,
  onComplete,
  onPreview,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const fileUrlMap = useMemo(() => new Map<string, string>(), []);
  const previewUrlMap = useMemo(() => new Map<string, string>(), []); // ✅ NUEVO: URLs de preview para limpiar después

  const getUploadParameters = async (file: UppyFile<any, any>) => {
    // pedir presign con filename + contentType
    const r = await fetch("/api/uploads/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream" }),
      credentials: "include",
    });
    if (!r.ok) throw new Error("No se pudo obtener URL de subida");
    const j = await r.json(); // { uploadUrl, key, fileUrl }
    if (!j.uploadUrl || !j.fileUrl) throw new Error("Presign inválido");
    fileUrlMap.set(file.id, j.fileUrl);

    // usa el mismo content-type que firmaste
    return {
      method: "PUT" as const,
      url: j.uploadUrl,
      headers: { "Content-Type": file.type || "application/octet-stream" },
    };
  };

  const [uppy] = useState(
    () =>
      new Uppy({ restrictions: { maxNumberOfFiles, maxFileSize }, autoProceed: false })
        .use(AwsS3, { shouldUseMultipart: false, getUploadParameters })
        .on("complete", (result) => {
          const urls = (result.successful || [])
            .map((f) => fileUrlMap.get(f.id))
            .filter((x): x is string => Boolean(x));
          onComplete?.(urls);
          
          // ✅ Limpiar URLs de preview después del upload completo
          previewUrlMap.forEach(url => URL.revokeObjectURL(url));
          previewUrlMap.clear();
        })
  );

  // ✅ NUEVO: Preview instantáneo cuando se agrega archivo
  useEffect(() => {
    if (!onPreview) return;

    const handleFileAdded = (file: UppyFile<any, any>) => {
      // Crear preview instantáneo desde el archivo en memoria
      if (file.data && file.type?.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file.data);
        previewUrlMap.set(file.id, previewUrl);
        onPreview(previewUrl); // ✅ Callback inmediato con preview
      }
    };

    uppy.on('file-added', handleFileAdded);

    // Cleanup
    return () => {
      uppy.off('file-added', handleFileAdded);
      // Limpiar URLs de preview cuando se desmonte el componente
      previewUrlMap.forEach(url => URL.revokeObjectURL(url));
      previewUrlMap.clear();
    };
  }, [uppy, onPreview, previewUrlMap]);

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName}>
        {children}
      </Button>
      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
      />
    </div>
  );
}
