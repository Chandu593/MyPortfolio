import { test } from "node:test";
import assert from "node:assert/strict";
import { isEmailJSConfig, sendSignal } from "../lib/emailjs.ts";

const config = { serviceId: "service_test", templateId: "template_test", publicKey: "public_test" };
const message = { name: " Test Visitor ", email: "visitor@example.com", message: " A test signal " };

test("missing or placeholder configuration cannot enable sending", () => {
  assert.equal(isEmailJSConfig(null), false);
  assert.equal(isEmailJSConfig({ ...config, publicKey: "" }), false);
  assert.equal(isEmailJSConfig({ ...config, serviceId: "[ADD YOUR SERVICE ID]" }), false);
  assert.equal(isEmailJSConfig(config), true);
});

test("sends the template contract once, with reply-to but no dynamic recipient", async t => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options });
    return new Response("OK", { status: 200 });
  });
  await sendSignal(config, message);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.emailjs.com/api/v1.0/email/send");
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.user_id, config.publicKey);
  assert.equal(body.service_id, config.serviceId);
  assert.equal(body.template_id, config.templateId);
  assert.equal(body.template_params.name, "Test Visitor");
  assert.equal(body.template_params.message, "A test signal");
  assert.equal(body.template_params.reply_to, message.email);
  assert.equal(body.template_params.to_email, undefined);
  assert.equal(body.accessToken, undefined);
});

test("invalid content never reaches EmailJS", async t => {
  const fetch = t.mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected request"); });
  for (const invalid of [{ ...message, name: " " }, { ...message, email: "invalid" }, { ...message, message: "a".repeat(3001) }]) {
    await assert.rejects(sendSignal(config, invalid), /valid email address/);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("provider rejection and rate limits are never treated as success", async t => {
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response("Rejected", { status: 400 }));
  await assert.rejects(sendSignal(config, message), /could not be sent/);
  fetch.mock.mockImplementation(async () => new Response("Limited", { status: 429 }));
  await assert.rejects(sendSignal(config, message), /temporarily limited/);
  assert.equal(fetch.mock.callCount(), 2);
});

test("uncertain delivery is reported and never retried automatically", async t => {
  const fetch = t.mock.method(globalThis, "fetch", async () => { throw new DOMException("Timed out", "TimeoutError"); });
  await assert.rejects(sendSignal(config, message), /could not be confirmed/);
  assert.equal(fetch.mock.callCount(), 1);
});
