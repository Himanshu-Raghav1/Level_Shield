"use client";
import { DefenseAction } from "@/types";
import { getActionBadgeClass, getActionLabel } from "@/data/mock";

interface Props {
  action: DefenseAction;
}

export default function ActionBadge({ action }: Props) {
  return (
    <span className={getActionBadgeClass(action)}>
      {getActionLabel(action)}
    </span>
  );
}
