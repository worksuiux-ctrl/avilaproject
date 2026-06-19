export type Sender = "user" | "bot";

export interface QuickReplyOption {
  id: string;
  label: string;
  flow?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  quickReplies?: QuickReplyOption[];
}

export interface FlowStep {
  botMessage: string;
  quickReplies?: QuickReplyOption[];
}

export interface Flow {
  id: string;
  title: string;
  steps: FlowStep[];
}
