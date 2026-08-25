export type CsPerson = {
  userId: string;
  displayName: string;
  email: string;
  entrada: string;
  inNumerator: boolean;
  note?: string;
};

export type CsRatioSeries = { label: string; x: number; y: number };

export type CsCard = {
  id: string;
  group: "pagante" | "free";
  title: string;
  hint: string;
  value: string;
  unavailable?: boolean;
  series?: CsRatioSeries[];
  people: CsPerson[];
};

export type CsMetrics = {
  closedWeekLabel: string;
  cohortLabel: string;
  monthLabel: string;
  cards: CsCard[];
};
