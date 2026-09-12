import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/lib/api/query-client";
import { PhotoLightbox } from "./PhotoLightbox";
import type { InterventionDetail, Photo } from "../types/intervention";

vi.mock("@/lib/api/client", () => ({
  apiFetchBlob: vi.fn().mockResolvedValue(new Blob()),
}));

const intervention: InterventionDetail = {
  id: "3915b537-5d7a-40b7-be54-87578e11be91",
  nomClient: "Hôtel Ivoire",
  adresse: "Boulevard Hassan II, Cocody",
  telephone1: "+2250700000001",
  telephone2: null,
  geolocalisation: null,
  motifSignale: null,
  datePrevue: "2026-09-14T09:00:00.000Z",
  technicienId: "tech-1",
  creeParId: "directeur-1",
  typeEquipement: null,
  problemeConstate: null,
  travauxRealises: null,
  statut: "PLANIFIEE",
  dateRealisation: null,
  creeLe: "2026-09-10T00:00:00.000Z",
  misAJourLe: "2026-09-10T00:00:00.000Z",
  photos: [],
  technicien: { id: "tech-1", nom: "Koffi N'Guessan", identifiant: "koffi", role: "TECHNICIEN", actif: true },
};

const photos: Photo[] = [
  {
    id: "photo-1",
    interventionId: intervention.id,
    categorie: "AVANT",
    cheminFichier: "x",
    creeLe: "2026-09-10T00:00:00.000Z",
  },
  {
    id: "photo-2",
    interventionId: intervention.id,
    categorie: "AVANT",
    cheminFichier: "y",
    creeLe: "2026-09-10T00:05:00.000Z",
  },
];

function renderLightbox(props: Partial<React.ComponentProps<typeof PhotoLightbox>> = {}) {
  const queryClient = createQueryClient();
  return render(
    <PhotoLightbox
      photos={photos}
      index={0}
      intervention={intervention}
      onClose={vi.fn()}
      onIndexChange={vi.fn()}
      {...props}
    />,
    { wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider> },
  );
}

describe("PhotoLightbox", () => {
  it("affiche l'indicateur de position et le nom du technicien", () => {
    renderLightbox();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("Koffi N'Guessan")).toBeInTheDocument();
  });

  it("declenche onClose sur Echap et onIndexChange sur les fleches", () => {
    const onClose = vi.fn();
    const onIndexChange = vi.fn();
    renderLightbox({ onClose, onIndexChange });

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(onIndexChange).toHaveBeenCalledWith(1);

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(onIndexChange).not.toHaveBeenCalledWith(-1);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("n'affiche pas la fleche precedente sur la premiere photo ni suivante sur la derniere", () => {
    const { unmount } = renderLightbox({ index: 0 });
    expect(screen.queryByLabelText("Photo précédente")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Photo suivante")).toBeInTheDocument();
    unmount();

    renderLightbox({ index: 1 });
    expect(screen.getByLabelText("Photo précédente")).toBeInTheDocument();
    expect(screen.queryByLabelText("Photo suivante")).not.toBeInTheDocument();
  });
});
