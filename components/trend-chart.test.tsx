import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TrendChart } from "@/components/trend-chart";

describe("TrendChart", () => {
  it("renders empty state when no points have entries", () => {
    const points = [
      { date: "2026-03-01", totalCalories: 0, entryCount: 0 },
      { date: "2026-03-02", totalCalories: 0, entryCount: 0 },
    ];

    const { container, getByText } = render(<TrendChart title="7-day trend" points={points} timezone="UTC" />);

    expect(getByText("No logs yet. Add a meal to see your calorie trend.")).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders sparse trend and exposes tooltip labels", () => {
    const points = [
      { date: "2026-03-01", totalCalories: 1600, entryCount: 2 },
      { date: "2026-03-02", totalCalories: 0, entryCount: 0 },
      { date: "2026-03-03", totalCalories: 2100, entryCount: 3 },
    ];

    const { getByLabelText, container } = render(
      <TrendChart title="7-day trend" points={points} timezone="UTC" />,
    );

    expect(getByLabelText("Mar 1: 1600 kcal")).toBeInTheDocument();
    expect(getByLabelText("Mar 2: 0 kcal")).toBeInTheDocument();
    expect(getByLabelText("Mar 3: 2100 kcal")).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });
});
