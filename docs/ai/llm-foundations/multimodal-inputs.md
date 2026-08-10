---
title: Multimodal Inputs
summary: Images, PDFs, and screenshots as first-class prompt content — what they cost in tokens and where they quietly fail.
level: deep
minutes: 20
order: 8
tags: [llm, fundamentals, vision, cost]

related:
  - ai/llm-foundations/tokens-and-context-windows
  - ai/working-with-the-api/the-messages-api-shape
  - ai/ai-security/prompt-injection

resources:
  - title: Vision
    url: https://platform.claude.com/docs/en/build-with-claude/vision
    source: Anthropic
    type: docs
    minutes: 15
    primary: true
  - title: PDF support
    url: https://platform.claude.com/docs/en/build-with-claude/pdf-support
    source: Anthropic
    type: docs
    minutes: 10
  - title: Images and vision
    url: https://platform.openai.com/docs/guides/images-vision
    source: OpenAI
    type: docs
    minutes: 15 # unverified
---

## In one line

An image is just another content block in the message, converted to tokens by area — which makes vision features easy to build and easy to make accidentally expensive.

## What it is

The message content array holds blocks, and an image block is one of them: base64 bytes with a media type, a URL, or a file id from a prior upload. The model attends to image tokens and text tokens in the same context, so "here is a screenshot, here is the bug report, tell me what's wrong" is a single ordinary request.

Cost scales with pixels. Recent frontier models raised the maximum resolution — long edge into the low thousands of pixels — which improved accuracy on dense screenshots, charts, and documents, but multiplied the token cost of a full-resolution image by roughly three. A page of a PDF costs meaningfully more than the same page as extracted text. If you do not need the fidelity, downscaling client-side before upload is the cheapest optimisation available; if you do need it — reading a dense table, or a computer-use agent locating a button — send the full resolution and pay.

PDFs are handled as a document block and processed page by page as both text and image, which is what lets the model read layout, tables, and figures rather than a flattened text extraction. That fidelity has limits: page and size caps apply, and for a large corpus of text-heavy PDFs an extraction pipeline plus retrieval is cheaper and more searchable than sending pages.

The failure modes are worth knowing. Models are good at description and layout and weaker at precise counting, small text, and exact spatial measurement, though this has improved sharply. Giving the model tools to crop and re-examine a region is often more effective than turning up reasoning effort. And every image is untrusted input: text inside a screenshot is read as text, so an image is a prompt-injection channel exactly like a fetched web page.

For the practical round, the shape that comes up most is a UI that accepts a dragged-in screenshot or PDF: file size limits, client-side resize, a preview, and clear handling for the unsupported-format case.

## Why it matters

At AI-forward product companies a screenshot-in or document-in flow is common, and the take-home brief frequently includes one. The differentiator is not getting it working — it is knowing that images are billed by area, that a naive full-resolution upload of every page will dominate the bill, and that image content is an injection surface.

## Key points

- An image is a content block alongside text in the same message; there is no separate vision endpoint.
- Token cost scales with image area, so resolution is the main cost lever — downscale client-side unless the task genuinely needs the detail.
- Higher-resolution support improved dense-document and screenshot accuracy, at roughly triple the tokens per image; it is a deliberate trade, not a free upgrade.
- PDFs are processed per page as text and image together, which preserves tables and layout but hits page and size limits — extract and retrieve instead for large text-heavy corpora.
- Models are strong on description and layout, weaker on exact counting and small text; giving them crop and zoom tools beats raising effort.
- Text inside an image is instructions to the model, so images are a prompt-injection vector and must be treated as untrusted.
- Uploading a file once and referencing it by id across requests avoids re-sending bytes in a multi-turn conversation.
