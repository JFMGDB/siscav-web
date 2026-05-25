import WhitelistTable from "@/components/features/whitelist/WhitelistTable";
import { getServerApiClient } from "@/lib/api/client";
import * as whitelistApi from "@/lib/api/whitelist";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Veículos Autorizados - SISCAV",
  description: "Gerenciar veículos autorizados",
};

export default async function WhitelistPage() {
  const client = await getServerApiClient();
  const initialData = await whitelistApi.getWhitelist(client, 0, 100);
  return <WhitelistTable initialData={initialData} />;
}
