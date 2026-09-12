const TH_CLASSES =
  "sticky top-0 z-10 border-b border-line bg-paper pb-3 pt-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-text-weak";

function Barre({ width }: { width: string }) {
  return (
    <span
      className="inline-block h-[11px] animate-pulse rounded bg-line-soft align-middle"
      style={{ width }}
    />
  );
}

const LARGEURS = [45, 62, 55, 66, 62, 58];

export function InterventionsTableSkeleton() {
  return (
    <table className="w-full border-collapse text-[13px]">
      <thead>
        <tr>
          <th className={`${TH_CLASSES} w-[36%] pl-0`}>Client</th>
          <th className={`${TH_CLASSES} w-[170px]`}>Date prévue</th>
          <th className={`${TH_CLASSES} w-[20%]`}>Technicien</th>
          <th className={`${TH_CLASSES} w-[140px]`}>Statut</th>
          <th className={`${TH_CLASSES} w-9 pr-0`} />
        </tr>
      </thead>
      <tbody>
        {LARGEURS.map((largeur, index) => (
          <tr key={index} className="border-b border-line-soft">
            <td className="py-4 pl-0">
              <Barre width={`${largeur}%`} />
            </td>
            <td className="py-4">
              <Barre width="70%" />
            </td>
            <td className="py-4">
              <Barre width="60%" />
            </td>
            <td className="py-4">
              <Barre width="50%" />
            </td>
            <td className="py-4 pr-0" />
          </tr>
        ))}
      </tbody>
    </table>
  );
}
