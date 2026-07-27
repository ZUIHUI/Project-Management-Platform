import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MutationForm } from "../src/components/ui/index.jsx";

const renderForm = (busy) => renderToStaticMarkup(
  React.createElement(
    MutationForm,
    { busy, className: "space-y-5" },
    React.createElement("input", { name: "title" }),
    React.createElement("button", { type: "submit" }, "儲存"),
  ),
);

test("mutation forms announce and atomically lock a pending request", () => {
  const html = renderForm(true);

  assert.match(html, /<form aria-busy="true">/);
  assert.match(html, /<fieldset disabled=""/);
  assert.match(html, /class="min-w-0 border-0 p-0 space-y-5"/);
});

test("mutation forms remain interactive when no request is pending", () => {
  const html = renderForm(false);

  assert.doesNotMatch(html, /aria-busy=/);
  assert.doesNotMatch(html, /<fieldset disabled=/);
});
