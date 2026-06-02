import LogsTable from "@/components/features/logs/LogsTable";
import { getServerApiClient } from "@/lib/api/client";
import * as logsApi from "@/lib/api/logs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Histórico de Acesso - Mantis",
  description: "Visualizar histórico de acesso de veículos",
};

export default async function LogsPage() {
  const client = await getServerApiClient();
  const initialData = await logsApi.getLogs(client, { skip: 0, limit: 100 });
  return <LogsTable initialData={initialData} />;
}
