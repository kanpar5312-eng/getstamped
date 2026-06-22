// Next 16's segment-level loading.tsx — picked up automatically while a
// dashboard route's data fetches resolve. Delegates to the shared
// LoadingSkeleton so the shape matches every page in the section.
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export default function DashboardLoading() {
  return <LoadingSkeleton />;
}
