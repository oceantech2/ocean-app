import type { StatusProposta } from '../services/proposalApi';
import { STATUS_BADGE, STATUS_LABEL } from '../utils/propostaCalculo';

export default function StatusBadge({ status }: { status: StatusProposta }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_BADGE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
