---
layout: post
title: "How to Measure Your Brand's Visibility in AI Search"
description: "A complete method for measuring whether ChatGPT, Gemini, Perplexity, and Google AI Overviews recommend you. The four metrics that matter, how to build a baseline you can defend, what the tools actually do, and how to tell a real move from noise."
date: 2026-06-24
last_modified_at: 2026-07-30
category: learn
content_type: Guide
keywords: "how to measure AI search visibility, track AI search citations, AI visibility baseline, share of voice AI search, monitor brand in ChatGPT, AEO measurement, LLM visibility, LLM SEO, generative engine visibility tracking"
og_title: "How to Measure Your Brand's Visibility in AI Search"
og_description: "Most teams cannot tell whether AI recommends them. This is the measurement method: the four metrics that matter, how to build a baseline, and how to tell a real move from noise."
permalink: /learn/how-to-measure-ai-search-visibility/
schema_markup: '{"@context":"https://schema.org","@type":"Article","headline":"How to Measure Your Brand''s Visibility in AI Search","description":"A practical method for measuring AI search visibility across ChatGPT, Gemini, Perplexity, and Google AI Overviews, covering the four metrics that matter, how to build a defensible baseline, and how to separate signal from sampling noise.","author":{"@type":"Person","@id":"https://soulcraftagency.com/#evan-drake","name":"Evan Drake"},"datePublished":"2026-06-24","dateModified":"2026-07-30","publisher":{"@type":"Organization","name":"Soulcraft","url":"https://soulcraftagency.com"},"about":[{"@type":"Thing","name":"Answer Engine Optimization"},{"@type":"Thing","name":"AI search visibility"},{"@type":"Thing","name":"LLM visibility"}]}'
---

Ask a marketing team how they rank on Google and you get a dashboard. Ask them whether ChatGPT recommends them and you get a shrug, or worse, an anecdote: someone on the team typed the company name into a chat window last Tuesday and liked what came back.

That is not measurement. That is a vibe.

The awkward part is that the vibe is often wrong in both directions. Companies convinced they are invisible turn out to be cited constantly in the mid-funnel questions that actually drive deals. Companies convinced they are winning turn out to be showing up only when someone types their own name, which proves nothing except that the model can read.

This guide is the method we use to replace the shrug with a number.

## Why AI visibility resists measurement

Traditional search gave you a stable object to measure. One query, one results page, roughly the same for everyone, persistent enough to track daily. Rank tracking worked because there was a rank.

Answer engines broke all four of those assumptions.

**Responses are generated, not retrieved.** The same question asked twice can produce different text, different sources, and a different set of companies. There is no single correct answer sitting in an index waiting to be looked up.

**There is no page two.** A generative answer names three companies, or five, or one. Position eleven does not exist. You are in the answer or you are not, which makes the distribution brutally top-heavy compared to a ten-link results page.

**The surface is fragmented.** ChatGPT, Gemini, Claude, Perplexity, Copilot, and Google AI Overviews all retrieve differently, weight sources differently, and update on different schedules. Visibility in one implies very little about the others.

**Personalization and memory leak in.** Logged-in sessions carry history. Location shifts results. Your own team's account is the least representative sample of your market you could possibly choose.

All of which means measuring AI visibility is a sampling problem, not a lookup problem. You are estimating a distribution, and that changes what a valid method looks like.

## The four metrics that matter

Nearly everything worth knowing reduces to four numbers. Keep them separate. The most common analytical mistake in this field is collapsing them into a single "AI visibility score" that moves for reasons nobody can explain.

### 1. Presence

**Does your name appear in the response text at all?**

Presence is the floor. Expressed as a rate: of the prompts you track, what percentage produce a response that mentions you. It is the metric most worth watching in the first ninety days, because going from zero to occasionally-mentioned is the hardest and most valuable move you will make.

Presence says nothing about whether you were recommended. You can be present as a footnote, as a competitor's alternative, or as an example of what to avoid. That is what the other three metrics are for.

### 2. Citation

**Is your site linked as a source?**

Citation is mechanically different from presence, and the two come apart constantly. A model can describe your category position perfectly from training data without linking you. It can also cite your documentation page while recommending a competitor in the prose.

Track citation at the page level, not just the domain. Knowing that one guide earns citations while your homepage earns none tells you exactly what to build more of. Domain-level citation counts tell you almost nothing you can act on.

### 3. Share of voice

**When your category comes up, how often is it you rather than a competitor?**

This is the number executives actually care about, and the one most often computed wrong. Share of voice is only meaningful against a defined competitive set and a defined prompt set. "We have 12% share of voice" is meaningless until you can finish the sentence: 12% of mentions across these forty prompts, against these six competitors, on these three platforms, over this date range.

Define the competitive set before you start measuring. Redefining it later to include a company you happen to beat is how measurement programs quietly become marketing for themselves.

### 4. Sentiment

**When you are mentioned, what is being said?**

Presence with negative sentiment is worse than absence. This is the metric teams skip because it feels soft, and it is the one that produces the genuine emergencies. A single unflattering article, a stale review, or an old forum thread can anchor how a model characterizes you across thousands of responses, and it will keep doing it until the underlying source changes.

Sentiment is also where clustering matters more than averages. An overall score of "mostly positive" can hide a specific, repeatable negative association attached to one product line, one geography, or one comparison. Look at the clusters.

## Building a baseline you can defend

A baseline is not a screenshot. It is a repeatable procedure that a skeptical person could run again and get a comparable answer.

### Step one: write the prompt set

This is the entire ballgame, and it is where most programs go wrong on day one.

Your prompt set is the population you are sampling. If it is unrepresentative, every number downstream is unrepresentative, no matter how sophisticated the tooling. Build it from how buyers actually ask, not from your keyword list.

Cover four stages:

- **Unaware.** The problem, stated without a category name. "Our content is not showing up when people ask AI about our industry."
- **Category.** The solution class. "What is answer engine optimization and do I need it?"
- **Comparison.** The shortlist. "Best AEO agencies for a Series B startup." "Scrunch vs Profound."
- **Branded.** Your name. "Is Soulcraft any good?"

Weight toward the middle two. Branded prompts feel great and predict nothing, because someone typing your name has already found you. If more than a fifth of your prompt set is branded, your visibility numbers are inflated and you will not find out until a quarter has gone by.

Forty to sixty prompts is a workable starting range for a focused category. Fewer than twenty and single-response variance will swamp any signal you are trying to read.

Write them once, in a file, with the persona and stage recorded next to each. Then freeze the set. A prompt set that quietly changes between measurement periods makes trend analysis fiction.

### Step two: fix the conditions

Every variable you do not control becomes noise you cannot explain later. Record and hold constant:

- Which platforms, and which model versions where you can see them
- Logged out, or a clean account with no history
- Location and language
- Day and time of the run, held roughly consistent
- How many times each prompt runs

That last one matters more than people expect. Because responses are generated, one run of one prompt is a single draw from a distribution. Run each prompt several times and record the rate, not the outcome. A company appearing in three of five runs is meaningfully different from one appearing in five of five, and a single run cannot tell those apart.

### Step three: record the raw responses

Store the full text, not just your extracted metrics. You will want to reread them.

Response text is where the real insight lives, and it is qualitatively different from anything a rank tracker ever gave you. You get to read, in plain language, the reason a model gave for recommending someone else. That reason is a content brief. It is the most direct competitive intelligence available in this channel, and teams throw it away by logging only a yes or no.

Read the responses where you lose. All of them, at least once. It is tedious, and it is the highest-value hour in the entire program.

### Step four: set the comparison window

Pick a cadence and hold it. Weekly runs, monthly reporting, quarterly strategy is a rhythm that works for most teams. Weekly gives you enough draws to smooth variance. Monthly is slow enough that a content change has plausibly had time to propagate.

Then, before you look at any result, decide what size of move you will treat as real. Write the number down. A four-point swing in presence across fifty prompts run five times each is usually noise. Deciding that after you see the number is how measurement becomes storytelling.

## Doing it by hand versus buying tooling

Both are legitimate. The choice is about scale, not sophistication.

**By hand** works genuinely well at small scale. Forty prompts, three platforms, five runs each is six hundred responses. That is a long afternoon with a spreadsheet, and the person who does it will understand the category better than any dashboard could teach them. For a first baseline, we often recommend doing it manually once even when a client has already bought a platform. The reading is the point.

It stops working the moment you want weekly trends, historical comparison, or more than a couple of platforms. Manual measurement does not fail by producing wrong numbers. It fails by not happening in week six.

**Platforms** solve the scheduling, the storage, the multi-platform coverage, and the trend math. Scrunch, Profound, and Ahrefs Brand Radar all operate in this space and all approach it slightly differently. We use Scrunch for most client programs and Ahrefs Brand Radar alongside it, which is a preference formed by the shape of our work rather than a claim that everyone else is wrong.

Three questions worth asking any vendor, because the answers differentiate them more than the feature lists do:

1. **How many times is each prompt actually run, and is that number exposed?** If a platform runs each prompt once per cycle, its week-over-week movement is substantially sampling noise, and you cannot tell because the denominator is hidden.
2. **Can you export raw response text?** If you can only export metrics, you have bought a dashboard rather than an intelligence source, and you have lost the most useful part.
3. **Are presence and citation reported as separate metric families?** Vendors that blend them into one score are hiding the distinction that matters most for deciding what to do next.

The honest summary: tooling is worth paying for once you are measuring continuously, and worth nothing at all if the prompt set underneath it is bad. The platform cannot fix a prompt set that does not reflect your buyers. Nothing can.

## LLM visibility, LLM SEO, GEO, AEO

These terms get used interchangeably, and the distinctions are softer than anyone selling them admits.

**LLM visibility** usually means the measurement side: whether models mention and cite you. **LLM SEO** and **generative engine optimization** usually mean the work you do about it. **Answer engine optimization** is the broadest of the four and the one we use, because it covers the surfaces that answer questions regardless of whether a language model is the mechanism.

The vocabulary will keep churning. The underlying question does not: when a machine answers a question your buyer is asking, are you in the answer, is it linking you, and is it saying something true and good.

If you want the work rather than the measurement, that is the [answer engine optimization guide](/learn/answer-engine-optimization-complete-guide/).

## What good actually looks like

There is no universal benchmark, and anyone who quotes you one without knowing your category is guessing. Category breadth, competitor count, and how much of your space is documented publicly all move the numbers enormously. A niche B2B category with four players and thin coverage behaves nothing like a crowded consumer space.

What travels across categories is the shape of progress:

- **Presence rises before citation.** Models mention you from accumulated context well before they start linking you as a source.
- **Branded prompts saturate first and mean least.** Winning them is table stakes and predicts nothing about the rest.
- **Comparison prompts move last and matter most.** They are the closest thing to a purchase decision in the entire set, and they are the hardest to shift.
- **Sentiment moves in steps, not slopes.** It tends to sit still and then jump when a specific underlying source changes.

Track your own trend against your own baseline. That comparison is real. Cross-category benchmarks mostly are not.

## Measure before you build

The reason to do this first is not rigor for its own sake. It is that AI visibility work is unusually easy to fake progress on.

Publish thirty pages, watch some number go up, declare victory. Without a frozen prompt set, a defined competitive set, and a pre-committed threshold for what counts as a real move, you cannot distinguish that from the model updating, a competitor going quiet, or five hundred coin flips landing your way this month.

Measurement is what makes the work falsifiable. It also tells you which of the four metrics is actually your problem, and those problems have completely different fixes. A presence problem is a coverage and entity problem. A citation problem is a structure and source-quality problem. A share of voice problem is a positioning problem. A sentiment problem is usually one specific piece of content you have not found yet.

Find out which one you have. Then go build.

---

*Soulcraft builds and runs AI visibility measurement programs for growth-stage companies, and the systems that move the numbers afterward. If you want a baseline built, [start here](/contact/).*
