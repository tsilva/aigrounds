import { PlaygroundAssistantShell } from "@/components/playground-assistant-shell";

export default function PlaygroundsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PlaygroundAssistantShell>{children}</PlaygroundAssistantShell>;
}
