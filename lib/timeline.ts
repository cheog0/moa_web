export type TimelineItem = {
  id: string;
  date: string;
  title: string;
  decisions?: string;
};

export type ToastConfig = {
  message: React.ReactNode;
  type: "success" | "warning" | "error";
};
