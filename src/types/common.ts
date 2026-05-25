/**
 * Tipos comuns compartilhados em toda a aplicação
 */

/**
 * Status de acesso de veículos
 * Corresponde ao enum AccessStatus do backend
 */
export type AccessStatus = "Authorized" | "Denied";

/**
 * Tipo para mensagens do sistema (Snackbar)
 */
export type MessageType = "success" | "error" | "info" | "warning";

export interface Message {
  text: string;
  type: MessageType;
}
