export type TimelineItem = {
  id: string;
  date: string;
  title: string;
};

export type ToastConfig = {
  message: React.ReactNode;
  type: "success" | "warning" | "error";
};
