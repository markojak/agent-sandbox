import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DailySummaryCard } from "@/components/daily-summary-card";

describe("DailySummaryCard", () => {
  it("renders remaining state", () => {
    const { container, getByText } = render(
      <DailySummaryCard
        dateLabel="Mar 20"
        totalCalories={1800}
        calorieGoal={2200}
        remaining={400}
        overGoal={0}
        isOverGoal={false}
        entryCount={3}
      />,
    );

    expect(getByText("400 kcal remaining")).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders over-goal state", () => {
    const { container, getByText } = render(
      <DailySummaryCard
        dateLabel="Mar 20"
        totalCalories={2500}
        calorieGoal={2200}
        remaining={0}
        overGoal={300}
        isOverGoal
        entryCount={4}
      />,
    );

    expect(getByText("300 kcal over goal")).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });
});
