import type { Metadata } from "next";
import DesignLab from "@/components/lab/DesignLab";

export const metadata: Metadata = {
  title: "Motif — Design reference (Calm Ops)",
  description:
    "Reference surface for the Motif redesign: Atlassian-dense layout, React Bits motion, mock data only.",
};

export default function DesignPage() {
  return <DesignLab />;
}
