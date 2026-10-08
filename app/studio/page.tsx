import { listFreeStudios } from "@/lib/services/free-studio";
import { StudioLibrary } from "@/components/studio-library";
export const dynamic = "force-dynamic";
export default async function Page() {
  return <StudioLibrary projects={await listFreeStudios()} />;
}
