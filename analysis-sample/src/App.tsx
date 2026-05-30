import { createElement, type ReactElement } from "react";

type DashboardProps = {
  title: string;
  subtitle: string;
  widgets: Array<() => ReactElement>;
};

export function renderDashboard(props: DashboardProps): ReactElement {
  return createElement(
    "section",
    { className: "dashboard" },
    createElement("h1", null, props.title),
    createElement("p", { className: "subtitle" }, props.subtitle),
    ...props.widgets.map((Widget) => createElement(Widget)),
  );
}
