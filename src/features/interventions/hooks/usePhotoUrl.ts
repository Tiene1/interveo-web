import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetchBlob } from "@/lib/api/client";

/**
 * GET /photos/:id exige le JWT : impossible via <img src> direct.
 * On recupere le blob puis on cree un objectURL, libere au demontage.
 */
export function usePhotoUrl(photoId: string) {
  const query = useQuery({
    queryKey: ["photos", photoId],
    queryFn: () => apiFetchBlob(`/photos/${photoId}`),
  });

  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!query.data) return;
    const objectUrl = URL.createObjectURL(query.data);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [query.data]);

  return { url, isPending: query.isPending, isError: query.isError };
}
