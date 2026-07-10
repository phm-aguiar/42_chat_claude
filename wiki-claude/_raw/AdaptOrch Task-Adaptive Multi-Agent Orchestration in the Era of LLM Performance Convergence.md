---
title: "AdaptOrch: Task-Adaptive Multi-Agent Orchestration in the Era of LLM Performance Convergence"
source: "https://arxiv.org/html/2602.16873?hl=pt-BR"
author:
published:
created: 2026-07-10
description:
tags:
  - "clippings"
---
Geunbin Yu  
Department of Artificial Intelligence, Korea National Open University  
ict03@rfems.com  
ORCID: [0009-0006-2879-9514](https://orcid.org/0009-0006-2879-9514)

###### Abstract

As large language models (LLMs) from diverse providers converge toward comparable benchmark performance, the traditional paradigm of selecting a single best model per task yields diminishing returns. We argue that orchestration topology—the structural composition of how multiple agents are coordinated, parallelized, and synthesized—now dominates system-level performance over individual model capability. We present AdaptOrch, a formal framework for task-adaptive multi-agent orchestration that dynamically selects among four canonical topologies (parallel, sequential, hierarchical, and hybrid) based on task dependency graphs and empirically derived domain characteristics. Our framework introduces three key contributions: (1) Performance Convergence Scaling Law, formalizing conditions under which orchestration selection outweighs model selection; (2) Topology Routing Algorithm that maps task decomposition DAGs to optimal orchestration patterns in $O(|V|+|E|)$ time; and (3) Adaptive Synthesis Protocol with provable termination guarantees and heuristic consistency scoring for parallel agent outputs. We validate AdaptOrch across coding (SWE-bench), reasoning (GPQA), and retrieval-augmented generation tasks, demonstrating that topology-aware orchestration achieves 12–23% improvement over static single-topology baselines, even when using identical underlying models. Our results establish orchestration design as a first-class optimization target independent of model scaling.

Keywords: multi-agent systems, LLM orchestration, task-adaptive routing, parallel agent execution, performance convergence

## 1 Introduction

The landscape of large language models in early 2026 presents a paradoxical challenge: as more models achieve near-identical benchmark scores, the marginal value of model selection diminishes while the complexity of choosing among them grows. GPT-4o, Claude 3.5 Sonnet, Gemini 2.0, Llama 3.3 70B, DeepSeek-V3, and Qwen 2.5 72B now cluster within 2–5% of each other on standard benchmarks including MMLU, HumanEval, and MATH [^7]. This performance convergence reshapes the optimization frontier. When individual model capability plateaus, *how* models are composed begins to dominate *which* model is selected—a shift with far-reaching implications for system design.

Current orchestration approaches fall into two broad categories. Static frameworks—Model Context Protocol (MCP) [^2], LangGraph [^10], and CrewAI [^12] —define fixed execution topologies (chains, graphs, or role-based teams) that persist regardless of what the task demands. A second category, routing-based systems like Mixture-of-Agents (MoA) [^18] and LLM-Blender [^8], dynamically selects or blends model outputs yet leaves the structural topology of agent coordination untouched. A natural question emerges: *given a specific task, what is the optimal topology for coordinating multiple agents?*

Recent practical advances illuminate this gap. Both Claude Code’s Agent Teams [^3] and OpenCode’s parallel subagent architecture [^13] show that parallel execution of specialized agents—each in its own context window, working on an independent subtask—can compress multi-hour sequential workflows into minutes. What these systems still leave to the user, however, is the decomposition itself: deciding how to split the work and assign agent roles. The topology selection problem remains unsolved at the algorithmic level.

<svg height="237.33" id="S1.F1.pic1" overflow="visible" version="1.1" viewBox="0 0 500.55 237.33" width="500.55"><g transform="translate(0,237.33) matrix(1 0 0 -1 0 0) translate(240.43,0) translate(0,79.29)"><g fill="#000000" stroke="#000000" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;"><g stroke-width="0.4pt"><g fill="#000000" stroke="#000000" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 -211.61 133.47)"><foreignObject height="8.65" overflow="visible" style="--ltx-fo-width:9.99em;--ltx-fo-height:0.59em;--ltx-fo-depth:0em;" transform="matrix(1 0 0 -1 0 8.65)" width="147.22"><span id="S1.F1.pic1.4.4.4.4.4.1.1" style="font-size:90%;">Era 1: Model Selection</span></foreignObject></g> <g fill="#000000" stroke="#000000" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 47.28 134.68)"><foreignObject height="11.07" overflow="visible" style="--ltx-fo-width:12.31em;--ltx-fo-height:0.59em;--ltx-fo-depth:0.16em;" transform="matrix(1 0 0 -1 0 8.65)" width="181.43"><span id="S1.F1.pic1.5.5.5.5.5.1.1" style="font-size:90%;">Era 2: Orchestration Design</span></foreignObject></g> <g fill="#ECECEC" style="--ltx-fill-color:#ECECEC;"><path d="M -100.02 114.17 L -175.57 114.17 C -178.62 114.17 -181.1 111.7 -181.1 108.64 L -181.1 88.21 C -181.1 85.16 -178.62 82.68 -175.57 82.68 L -100.02 82.68 C -96.97 82.68 -94.49 85.16 -94.49 88.21 L -94.49 108.64 C -94.49 111.7 -96.97 114.17 -100.02 114.17 Z M -181.1 82.68"></path></g><g fill="#000000" stroke="#000000" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 -150.99 94.1)"><text transform="matrix(1 0 0 -1 0 0)">Task</text></g> <g fill="#FFD9D9" style="--ltx-fill-color:#FFD9D9;"><path d="M -159.08 62.99 L -234.62 62.99 C -237.68 62.99 -240.16 60.51 -240.16 57.46 L -240.16 37.03 C -240.16 33.97 -237.68 31.5 -234.62 31.5 L -159.08 31.5 C -156.02 31.5 -153.54 33.97 -153.54 37.03 L -153.54 57.46 C -153.54 60.51 -156.02 62.99 -159.08 62.99 Z M -240.16 31.5"></path></g><g fill="#000000" stroke="#000000" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 -221.2 42.92)"><text transform="matrix(1 0 0 -1 0 0)">Model A</text></g> <g fill="#FFD9D9" style="--ltx-fill-color:#FFD9D9;"><path d="M -100.02 62.99 L -175.57 62.99 C -178.62 62.99 -181.1 60.51 -181.1 57.46 L -181.1 37.03 C -181.1 33.97 -178.62 31.5 -175.57 31.5 L -100.02 31.5 C -96.97 31.5 -94.49 33.97 -94.49 37.03 L -94.49 57.46 C -94.49 60.51 -96.97 62.99 -100.02 62.99 Z M -181.1 31.5"></path></g><g fill="#000000" stroke="#000000" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 -161.88 42.92)"><text transform="matrix(1 0 0 -1 0 0)">Model B</text></g> <g fill="#FFD9D9" style="--ltx-fill-color:#FFD9D9;"><path d="M -40.97 62.99 L -116.51 62.99 C -119.57 62.99 -122.05 60.51 -122.05 57.46 L -122.05 37.03 C -122.05 33.97 -119.57 31.5 -116.51 31.5 L -40.97 31.5 C -37.91 31.5 -35.43 33.97 -35.43 37.03 L -35.43 57.46 C -35.43 60.51 -37.91 62.99 -40.97 62.99 Z M -122.05 31.5"></path></g><g fill="#000000" stroke="#000000" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 -102.92 42.92)"><text transform="matrix(1 0 0 -1 0 0)">Model C</text></g> <g fill="#ECECEC" style="--ltx-fill-color:#ECECEC;"><path d="M -100.02 15.75 L -175.57 15.75 C -178.62 15.75 -181.1 13.27 -181.1 10.21 L -181.1 -10.21 C -181.1 -13.27 -178.62 -15.75 -175.57 -15.75 L -100.02 -15.75 C -96.97 -15.75 -94.49 -13.27 -94.49 -10.21 L -94.49 10.21 C -94.49 13.27 -96.97 15.75 -100.02 15.75 Z M -181.1 -15.75"></path></g><g fill="#000000" stroke="#000000" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 -168.68 -4.32)"><text transform="matrix(1 0 0 -1 0 0)">Select Best</text></g> <g fill="#D9FFD9" style="--ltx-fill-color:#D9FFD9;"><path d="M -100.02 -31.5 L -175.57 -31.5 C -178.62 -31.5 -181.1 -33.97 -181.1 -37.03 L -181.1 -57.46 C -181.1 -60.51 -178.62 -62.99 -175.57 -62.99 L -100.02 -62.99 C -96.97 -62.99 -94.49 -60.51 -94.49 -57.46 L -94.49 -37.03 C -94.49 -33.97 -96.97 -31.5 -100.02 -31.5 Z M -181.1 -62.99"></path></g><g fill="#000000" stroke="#000000" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 -158.42 -50.29)"><text transform="matrix(1 0 0 -1 0 0)">Output</text></g> <g stroke-width="0.8pt"><path d="M -156.29 82.4 L -174.51 66.62" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(-0.7558 -0.6548 0.6548 -0.7558 -172.42 68.42)"><path d="M 6.4 0 L 1.79 1.71 L 3.04 0 L 1.79 -1.71 Z"></path></g></g><g stroke-width="0.8pt"><path d="M -137.8 82.4 L -137.8 68.38" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.0 -1.0 1.0 0.0 -137.8 71.14)"><path d="M 6.4 0 L 1.79 1.71 L 3.04 0 L 1.79 -1.71 Z"></path></g></g><g stroke-width="0.8pt"><path d="M -119.3 82.4 L -101.09 66.62" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.7558 -0.6548 0.6548 0.7558 -103.17 68.42)"><path d="M 6.4 0 L 1.79 1.71 L 3.04 0 L 1.79 -1.71 Z"></path></g></g><g stroke-width="0.8pt"><path d="M -176.82 31.22 L -161.81 19.22" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.78099 -0.62456 0.62456 0.78099 -163.97 20.94)"><path d="M 6.4 0 L 1.79 1.71 L 3.04 0 L 1.79 -1.71 Z"></path></g></g><g stroke-width="0.8pt"><path d="M -137.8 31.22 L -137.8 21.14" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.0 -1.0 1.0 0.0 -137.8 23.9)"><path d="M 6.4 0 L 1.79 1.71 L 3.04 0 L 1.79 -1.71 Z"></path></g></g><g stroke-width="0.8pt"><path d="M -98.77 31.22 L -113.78 19.22" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(-0.78099 -0.62456 0.62456 -0.78099 -111.62 20.94)"><path d="M 6.4 0 L 1.79 1.71 L 3.04 0 L 1.79 -1.71 Z"></path></g></g><g stroke-width="0.8pt"><path d="M -137.8 -16.02 L -137.8 -26.11" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.0 -1.0 1.0 0.0 -137.8 -23.35)"><path d="M 6.4 0 L 1.79 1.71 L 3.04 0 L 1.79 -1.71 Z"></path></g></g><g fill="#ECECEC" style="--ltx-fill-color:#ECECEC;"><path d="M 175.57 114.17 L 100.02 114.17 C 96.97 114.17 94.49 111.7 94.49 108.64 L 94.49 88.21 C 94.49 85.16 96.97 82.68 100.02 82.68 L 175.57 82.68 C 178.62 82.68 181.1 85.16 181.1 88.21 L 181.1 108.64 C 181.1 111.7 178.62 114.17 175.57 114.17 Z M 94.49 82.68"></path></g><g fill="#000000" stroke="#000000" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 124.61 94.1)"><text transform="matrix(1 0 0 -1 0 0)">Task</text></g> <g fill="#FFECD9" style="--ltx-fill-color:#FFECD9;"><path d="M 175.57 62.99 L 100.02 62.99 C 96.97 62.99 94.49 60.51 94.49 57.46 L 94.49 37.03 C 94.49 33.97 96.97 31.5 100.02 31.5 L 175.57 31.5 C 178.62 31.5 181.1 33.97 181.1 37.03 L 181.1 57.46 C 181.1 60.51 178.62 62.99 175.57 62.99 Z M 94.49 31.5"></path></g><g fill="#000000" stroke="#000000" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 104.25 38.1)"><g transform="matrix(1 0 0 -1 0 19.44)"><g transform="matrix(1 0 0 1 0 8.51)"><g transform="matrix(1 0 0 -1 0 0)"><text transform="matrix(1 0 0 -1 0 0)">Decompose </text></g></g><g transform="matrix(1 0 0 1 0 19.44)"><g transform="matrix(1 0 0 -1 9.64 0)"><text transform="matrix(1 0 0 -1 0 0)">+ Route</text></g></g></g></g> <g fill="#D9D9FF" style="--ltx-fill-color:#D9D9FF;"><path d="M 96.83 7.87 L 21.28 7.87 C 18.23 7.87 15.75 5.4 15.75 2.34 L 15.75 -18.09 C 15.75 -21.14 18.23 -23.62 21.28 -23.62 L 96.83 -23.62 C 99.88 -23.62 102.36 -21.14 102.36 -18.09 L 102.36 2.34 C 102.36 5.4 99.88 7.87 96.83 7.87 Z M 15.75 -23.62"></path></g><g fill="#000000" stroke="#000000" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 32.46 -10.99)"><foreignObject height="12.45" overflow="visible" style="--ltx-fo-width:4.18em;--ltx-fo-height:0.73em;--ltx-fo-depth:0.24em;" transform="matrix(1 0 0 -1 0 9.34)" width="53.54"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline" data-latex="\parallel"><semantics><mo mathsize="0.900em">∥</mo> <annotation encoding="application/x-tex">\parallel</annotation></semantics></math> <span id="S1.F1.pic1.6.6.6.6.6.2.1" style="font-size:90%;">Parallel</span></foreignObject></g> <g fill="#D9D9FF" style="--ltx-fill-color:#D9D9FF;"><path d="M 175.57 7.87 L 100.02 7.87 C 96.97 7.87 94.49 5.4 94.49 2.34 L 94.49 -18.09 C 94.49 -21.14 96.97 -23.62 100.02 -23.62 L 175.57 -23.62 C 178.62 -23.62 181.1 -21.14 181.1 -18.09 L 181.1 2.34 C 181.1 5.4 178.62 7.87 175.57 7.87 Z M 94.49 -23.62"></path></g><g fill="#000000" stroke="#000000" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 103.66 -11.12)"><foreignObject height="11.33" overflow="visible" style="--ltx-fo-width:5.36em;--ltx-fo-height:0.7em;--ltx-fo-depth:0.19em;" transform="matrix(1 0 0 -1 0 8.91)" width="68.63"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline" data-latex="\rightarrow"><semantics><mo mathsize="0.900em" stretchy="false">→</mo> <annotation encoding="application/x-tex">\rightarrow</annotation></semantics></math> <span id="S1.F1.pic1.7.7.7.7.7.2.1" style="font-size:90%;">Sequential</span></foreignObject></g> <g fill="#D9D9FF" style="--ltx-fill-color:#D9D9FF;"><path d="M 254.31 7.87 L 178.76 7.87 C 175.71 7.87 173.23 5.4 173.23 2.34 L 173.23 -18.09 C 173.23 -21.14 175.71 -23.62 178.76 -23.62 L 254.31 -23.62 C 257.36 -23.62 259.84 -21.14 259.84 -18.09 L 259.84 2.34 C 259.84 5.4 257.36 7.87 254.31 7.87 Z M 173.23 -23.62"></path></g><g fill="#000000" stroke="#000000" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 181.66 -10.99)"><foreignObject height="11.07" overflow="visible" style="--ltx-fo-width:5.5em;--ltx-fo-height:0.68em;--ltx-fo-depth:0.19em;" transform="matrix(1 0 0 -1 0 8.65)" width="70.46"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline" data-latex="\triangle"><semantics><mi mathsize="0.900em" mathvariant="normal">△</mi> <annotation encoding="application/x-tex">\triangle</annotation></semantics></math> <span id="S1.F1.pic1.8.8.8.8.8.2.1" style="font-size:90%;">Hierarchy</span></foreignObject></g> <g fill="#D9FFD9" style="--ltx-fill-color:#D9FFD9;"><path d="M 175.57 -43.31 L 100.02 -43.31 C 96.97 -43.31 94.49 -45.79 94.49 -48.84 L 94.49 -69.27 C 94.49 -72.33 96.97 -74.8 100.02 -74.8 L 175.57 -74.8 C 178.62 -74.8 181.1 -72.33 181.1 -69.27 L 181.1 -48.84 C 181.1 -45.79 178.62 -43.31 175.57 -43.31 Z M 94.49 -74.8"></path></g><g fill="#000000" stroke="#000000" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 108.6 -62.17)"><text transform="matrix(1 0 0 -1 0 0)">Synthesize</text></g></g><g stroke-width="0.8pt"><path d="M 137.8 82.4 L 137.8 68.38" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.0 -1.0 1.0 0.0 137.8 71.14)"><path d="M 6.4 0 L 1.79 1.71 L 3.04 0 L 1.79 -1.71 Z"></path></g></g><g stroke-width="0.8pt"><path d="M 114.91 31.22 L 86.13 11.08" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(-0.8193 -0.57336 0.57336 -0.8193 88.4 12.67)"><path d="M 6.4 0 L 1.79 1.71 L 3.04 0 L 1.79 -1.71 Z"></path></g></g><g stroke-width="0.8pt"><path d="M 137.8 31.22 L 137.8 13.26" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.0 -1.0 1.0 0.0 137.8 16.02)"><path d="M 6.4 0 L 1.79 1.71 L 3.04 0 L 1.79 -1.71 Z"></path></g></g><g stroke-width="0.8pt"><path d="M 160.68 31.22 L 189.46 11.08" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.8193 -0.57336 0.57336 0.8193 187.2 12.67)"><path d="M 6.4 0 L 1.79 1.71 L 3.04 0 L 1.79 -1.71 Z"></path></g></g><g stroke-width="0.8pt"><path d="M 83.71 -23.9 L 108.87 -40.25" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.83853 -0.54486 0.54486 0.83853 106.55 -38.74)"><path d="M 6.4 0 L 1.79 1.71 L 3.04 0 L 1.79 -1.71 Z"></path></g></g><g stroke-width="0.8pt"><path d="M 137.8 -23.9 L 137.8 -37.92" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.0 -1.0 1.0 0.0 137.8 -35.16)"><path d="M 6.4 0 L 1.79 1.71 L 3.04 0 L 1.79 -1.71 Z"></path></g></g><g stroke-width="0.8pt"><path d="M 191.88 -23.9 L 166.72 -40.25" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(-0.83853 -0.54486 0.54486 -0.83853 169.04 -38.74)"><path d="M 6.4 0 L 1.79 1.71 L 3.04 0 L 1.79 -1.71 Z"></path></g></g></g><g color="#808080" fill="#808080" stroke="#808080" stroke-dasharray="3.0pt,3.0pt" stroke-dashoffset="0.0pt" stroke-width="0.8pt" style="--ltx-stroke-color:#808080;--ltx-fill-color:#808080;--ltx-fg-color:#808080;"><path d="M 0 -78.74 L 0 157.48" style="fill:none"></path></g></g></svg>

Figure 1: Paradigm shift from model selection (left) to orchestration design (right). When model capabilities converge, the dominant optimization variable becomes the structural topology of agent coordination.

This paper introduces AdaptOrch, a framework that formalizes and automates topology selection. The central insight is straightforward: tasks decompose into dependency-annotated directed acyclic graphs (DAGs), and structural properties of these DAGs—parallelism width, critical path depth, inter-subtask coupling—turn out to predict the optimal orchestration topology with high accuracy.

We make four contributions:

1. Performance Convergence Scaling Law (Section 3): We show that under $\epsilon$ -convergence of model capabilities, the variance in system performance attributable to orchestration topology exceeds that of model selection by a factor of $\Omega(1/\epsilon^{2})$, establishing topology selection as the dominant optimization target as models converge.
2. Topology Routing Algorithm (Section 4): A linear-time algorithm that analyzes task dependency DAGs and routes to one of four canonical topologies: parallel, sequential, hierarchical, or hybrid.
3. Adaptive Synthesis Protocol (Section 4.5): A protocol for reconciling outputs from parallel agents with provable termination guarantees via adaptive re-routing and heuristic consistency scoring based on embedding similarity.
4. Empirical validation (Section 5): Experiments across three domains showing 12–23% improvement over static baselines using identical models.

## 2 Related Work

### 2.1 LLM Performance Convergence

Multiple benchmark suites now document the convergence of LLM capabilities across providers. The Open LLM Leaderboard v2 [^7] shows top-10 models clustering within a 3-point MMLU range (87.2–90.1) as of January 2026. In a striking finding, [^15] demonstrated that Self-MoA—a single top model queried multiple times—outperforms diverse model mixing by 6.6% on AlpacaEval 2.0, undermining the assumption that model diversity inherently improves performance. Chatbot Arena [^23] ELO rankings tell a similar story: frontier models from OpenAI, Anthropic, Google, Meta, and Alibaba now occupy overlapping confidence intervals on general-purpose tasks. Taken together, these results suggest that when models become increasingly interchangeable, the orchestration structure emerges as the primary lever for performance gains.

### 2.2 Static Orchestration Frameworks

Model Context Protocol (MCP) [^2] standardizes tool-model interfaces but prescribes no topology for multi-agent coordination. LangGraph [^10] goes further, modeling workflows as directed graphs with parallel branches, conditional edges, and stateful execution—yet the topology must be designed manually. CrewAI [^12] takes a role-based approach, assigning agents fixed personas (e.g., researcher, writer, reviewer) in predetermined interaction patterns, while AutoGen [^20] supports multi-agent conversation but defaults to sequential round-robin communication. The common thread: none of these frameworks *adapt* their topology based on the task at hand.

### 2.3 Dynamic Model Composition

Mixture-of-Agents [^18] arranges models in layered pipelines where each layer refines previous outputs, achieving 65.1% on AlpacaEval 2.0 versus 57.5% for the best individual model. LLM-Blender [^8] uses a PairRanker to select among candidate outputs. DEI [^22] employs multi-agent committees for SWE-bench Lite, where the best-performing group achieves a 55% resolve rate versus 27.3% for the strongest individual open-source agent. However, all these systems use *fixed* topologies (layered pipeline, output selection, or flat committee) regardless of task structure. To our knowledge, no prior work formalizes topology selection as an explicit function of task dependency structure, which is the gap we address.

### 2.4 Parallel Agent Execution in Practice

Claude Code Agent Teams [^3] and the Superpowers framework [^16] demonstrate practical parallel execution with lead-agent orchestration, DAG-based task dependencies, and inbox-based inter-agent communication. OpenCode [^13] supports multi-provider agent routing with explicit permission-controlled subagent architectures. [^5] showed that multi-agent orchestration achieves 100% actionable recommendation rate versus 1.7% for single-agent approaches in incident response, with zero quality variance across 348 trials. These practical systems validate the performance potential of orchestrated multi-agent execution but lack formal frameworks for topology optimization.

### 2.5 Concurrent and Recent Work

Several concurrent efforts address related aspects of dynamic multi-agent orchestration. DyTopo [^11] optimizes agent communication topology via semantic matching between agent capabilities and subtask requirements; unlike our approach, their routing operates at the agent-pair level rather than selecting among canonical structural patterns, which limits interpretability of the chosen topology. MetaGen [^19] co-evolves agent roles and topologies through self-play, achieving impressive adaptation but sacrificing the predictability that our closed-form routing algorithm provides. ALMC [^1] introduces Manager-Judge-Optimizer role separation with adaptive collaboration, though their role-based decomposition differs fundamentally from our DAG-structure-based routing and does not provide explicit cost control. MoMA [^6] generalizes routing across both models and agents, treating the choice of orchestration strategy as a bandit problem; our work instead exploits task structure directly through DAG analysis, avoiding the sample complexity of online learning. S-DAG [^4], accepted at AAAI 2026, decomposes tasks into subject-based DAGs for multi-agent allocation—the closest work to ours in spirit, though their subjects correspond to semantic domains while our DAG nodes represent subtask dependencies with explicit coupling annotations. ORCH [^17] proposes a deterministic multi-agent protocol with fixed execution guarantees; our framework complements this by adding adaptive topology selection on top of deterministic execution primitives.

Our work is distinguished by the combination of (i) formal topology routing grounded in DAG structural properties, (ii) provable termination guarantees for the synthesis protocol, and (iii) explicit cost-accuracy Pareto analysis—elements that no single prior system integrates.

## 3 Problem Formalization

### 3.1 Model Convergence

###### Definition 1 (ϵ\\epsilon-Convergence).

A set of $n$ models $\mathcal{M}=\{M_{1},\ldots,M_{n}\}$ is $\epsilon$ -convergent on benchmark $\mathcal{B}$ if:

$$
\max_{i,j\in[n]}|S_{\mathcal{B}}(M_{i})-S_{\mathcal{B}}(M_{j})|\leq\epsilon
$$

where $S_{\mathcal{B}}(M_{i})$ denotes the score of model $M_{i}$ on benchmark $\mathcal{B}$, normalized to $[0,1]$.

For current frontier models on MMLU, $\epsilon\approx 0.03$; on HumanEval, $\epsilon\approx 0.05$.

### 3.2 Task Dependency Graphs

###### Definition 2 (Task Dependency DAG).

A task $T$ decomposes into a directed acyclic graph $G_{T}=(V,E,w,c)$ where:

- $V=\{v_{1},\ldots,v_{k}\}$ is the set of subtasks
- $E\subseteq V\times V$ encodes dependencies ($(v_{i},v_{j})\in E$ means $v_{i}$ must complete before $v_{j}$ starts)
- $w:V\to\mathbb{R}^{+}$ assigns estimated computational cost to each subtask
- $c:E\to[0,1]$ assigns coupling strength between dependent subtasks (degree of context sharing required)

###### Definition 3 (DAG Structural Properties).

For a task DAG $G_{T}=(V,E,w,c)$, we define:

$$
\displaystyle\text{Parallelism Width: }\quad\omega(G_{T})
$$
 
$$
\displaystyle=\max_{A\subseteq V}|A|\text{ s.t. }A\text{ is an antichain in }G_{T}
$$
 
$$
\displaystyle\text{Critical Path Depth: }\quad\delta(G_{T})
$$
 
$$
\displaystyle=\max_{\text{path }P}\sum_{v\in P}w(v)
$$
 
$$
\displaystyle\text{Coupling Density: }\quad\gamma(G_{T})
$$
 
$$
\displaystyle=\frac{\sum_{(u,v)\in E}c(u,v)}{|E|}
$$

### 3.3 Orchestration Topologies

We define four canonical topologies $\mathcal{T}=\{\tau_{P},\tau_{S},\tau_{H},\tau_{X}\}$:

###### Definition 4 (Canonical Topologies).

$$
\displaystyle\tau_{P}
$$
 
$$
\displaystyle:\text{{Parallel}}-\text{All subtasks execute concurrently; outputs merged post-hoc}
$$
 
$$
\displaystyle\tau_{S}
$$
 
$$
\displaystyle:\text{{Sequential}}-\text{Subtasks execute in topological order; each receives prior context}
$$
 
$$
\displaystyle\tau_{H}
$$
 
$$
\displaystyle:\text{{Hierarchical}}-\text{Lead agent decomposes and delegates; sub-agents report back}
$$
 
$$
\displaystyle\tau_{X}
$$
 
$$
\displaystyle:\text{{Hybrid}}-\text{DAG partitioned into parallel groups connected sequentially}
$$

Each topology $\tau$ induces a scheduling function $\sigma_{\tau}:G_{T}\to\text{ExecutionPlan}$ that maps the task DAG to a concrete execution ordering with agent assignments.

### 3.4 Performance Convergence Scaling Law

###### Proposition 1 (Orchestration Dominance under Convergence).

Let $\mathcal{M}$ be $\epsilon$ -convergent on task distribution $\mathcal{D}$. Let $\text{Var}_{M}$ denote performance variance from model selection and $\text{Var}_{\tau}$ denote performance variance from topology selection. For a task $T$ with dependency DAG $G_{T}$ having $k$ subtasks, under uniform subtask weights, Lipschitz aggregation ($L_{f}\leq 1$), and a topology quality coefficient $C_{\tau}\geq 1/(4k)$:

$$
\frac{\text{Var}_{\tau}}{\text{Var}_{M}}\geq\frac{(\omega(G_{T})-1)^{2}}{4\epsilon^{2}\cdot k}\cdot\left(1-\gamma(G_{T})\right)^{2}
$$

When $\epsilon\to 0$ (perfect convergence) and $\omega(G_{T})>1$ (parallelizable tasks), $\text{Var}_{\tau}/\text{Var}_{M}\to\infty$.

###### Proof sketch.

Model selection variance is bounded by $\text{Var}_{M}\leq\epsilon^{2}$ from Definition 1, using the correlated bound (all subtasks share the same model). Topology variance derives from the execution time ratio between worst-case (fully sequential: $\sum_{v}w(v)$) and best-case (maximally parallel: $\delta(G_{T})$) schedules. By Dilworth’s theorem, the minimum number of chains covering $G_{T}$ equals the maximum antichain width $\omega(G_{T})$. The speedup ratio $\sum_{v}w(v)/\delta(G_{T})\geq\omega(G_{T})$ when subtask weights are uniform. Coupling density $\gamma$ reduces effective parallelism by introducing synchronization overhead proportional to $\gamma^{2}$. Combining bounds yields the stated ratio. Full proof in Appendix A. ∎

###### Corollary 1.

For coding tasks (typical $\omega\geq 3$, $\gamma\leq 0.4$, $k\leq 6$, $\epsilon\approx 0.05$), the variance ratio satisfies $\text{Var}_{\tau}/\text{Var}_{M}\geq 20$, indicating that orchestration topology is the dominant performance factor over model selection.

## 4 The AdaptOrch Framework

<svg height="538.14" id="S4.F2.pic1" overflow="visible" version="1.1" viewBox="0 0 515.13 538.14" width="515.13"><g stroke="#000000" style="--ltx-stroke-color:#000000;" transform="translate(0,538.14) matrix(1 0 0 -1 0 0) translate(257.57,0) translate(0,517.9)"><g fill="#F0F0F0" stroke-width="0.8pt" style="--ltx-fill-color:#F0F0F0;"><path d="M 53.52 19.69 L -53.52 19.69 C -56.58 19.69 -59.06 17.21 -59.06 14.15 L -59.06 -14.15 C -59.06 -17.21 -56.58 -19.69 -53.52 -19.69 L 53.52 -19.69 C 56.58 -19.69 59.06 -17.21 59.06 -14.15 L 59.06 14.15 C 59.06 17.21 56.58 19.69 53.52 19.69 Z M -59.06 -19.69"></path></g><g fill="#000000" stroke="#000000" stroke-width="0.8pt" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 -37.54 -3.11)"><foreignObject height="11.07" overflow="visible" style="--ltx-fo-width:5.95em;--ltx-fo-height:0.68em;--ltx-fo-depth:0.19em;" transform="matrix(1 0 0 -1 0 8.65)" width="76.15"><span id="S4.F2.pic1.8.8.8.2.1" style="font-size:90%;">Input Task</span> <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline" data-latex="T"><semantics><mi mathsize="0.900em">T</mi> <annotation encoding="application/x-tex">T</annotation></semantics></math></foreignObject></g> <g fill="#FFF0E0" stroke-width="0.8pt" style="--ltx-fill-color:#FFF0E0;"><path d="M 77.58 -60.16 L -77.58 -60.16 C -80.64 -60.16 -83.11 -62.64 -83.11 -65.7 L -83.11 -94 C -83.11 -97.05 -80.64 -99.53 -77.58 -99.53 L 77.58 -99.53 C 80.64 -99.53 83.11 -97.05 83.11 -94 L 83.11 -65.7 C 83.11 -62.64 80.64 -60.16 77.58 -60.16 Z M -83.11 -99.53"></path></g><g fill="#000000" stroke="#000000" stroke-width="0.8pt" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 -78.5 -89.23)"><g transform="matrix(1 0 0 -1 0 18.76)"><g transform="matrix(1 0 0 1 0 8.65)"><g transform="matrix(1 0 0 -1 27.13 0)"><text transform="matrix(1 0 0 -1 0 0)">Task Decomposer </text></g></g><g transform="matrix(1 0 0 1 0 18.76)"><g transform="matrix(1 0 0 -1 0 0)"><foreignObject height="7.69" overflow="visible" style="--ltx-fo-width:13.35em;--ltx-fo-height:0.65em;--ltx-fo-depth:0em;" transform="matrix(1 0 0 -1 0 7.69)" width="157"><span id="S4.F2.pic1.9.9.9.1.1.1.1.1" style="font-size:80%;">LLM-based subtask extraction</span></foreignObject></g></g></g></g> <g fill="#FFE0E0" stroke-width="0.8pt" style="--ltx-fill-color:#FFE0E0;"><path d="M 82.55 -140.01 L -82.55 -140.01 C -85.6 -140.01 -88.08 -142.49 -88.08 -145.54 L -88.08 -173.84 C -88.08 -176.9 -85.6 -179.38 -82.55 -179.38 L 82.55 -179.38 C 85.6 -179.38 88.08 -176.9 88.08 -173.84 L 88.08 -145.54 C 88.08 -142.49 85.6 -140.01 82.55 -140.01 Z M -88.08 -179.38"></path></g><g fill="#000000" stroke="#000000" stroke-width="0.8pt" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 -83.47 -166.72)"><g transform="matrix(1 0 0 -1 0 16.2)"><g transform="matrix(1 0 0 1 0 8.51)"><g transform="matrix(1 0 0 -1 31.37 0)"><text transform="matrix(1 0 0 -1 0 0)">DAG Constructor </text></g></g><g transform="matrix(1 0 0 1 0 16.2)"><g transform="matrix(1 0 0 -1 0 0)"><foreignObject height="9.84" overflow="visible" style="--ltx-fo-width:14.16em;--ltx-fo-height:0.65em;--ltx-fo-depth:0.18em;" transform="matrix(1 0 0 -1 0 7.69)" width="166.58"><span id="S4.F2.pic1.10.10.10.1.1.1.1.1" style="font-size:80%;">Dependency &amp; coupling analysis</span></foreignObject></g></g></g></g> <g fill="#F7E0E8" stroke-width="0.8pt" style="--ltx-fill-color:#F7E0E8;"><path d="M 53.52 -219.86 L -53.52 -219.86 C -56.58 -219.86 -59.06 -222.33 -59.06 -225.39 L -59.06 -253.69 C -59.06 -256.75 -56.58 -259.23 -53.52 -259.23 L 53.52 -259.23 C 56.58 -259.23 59.06 -256.75 59.06 -253.69 L 59.06 -225.39 C 59.06 -222.33 56.58 -219.86 53.52 -219.86 Z M -59.06 -259.23"></path></g><g fill="#000000" stroke="#000000" stroke-width="0.8pt" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 -49.35 -247.84)"><g transform="matrix(1 0 0 -1 0 19.37)"><g transform="matrix(1 0 0 1 0 8.65)"><g transform="matrix(1 0 0 -1 0 0)"><text transform="matrix(1 0 0 -1 0 0)">Topology Router </text></g></g><g transform="matrix(1 0 0 1 0 19.37)"><g transform="matrix(1 0 0 -1 16.51 0)"><foreignObject height="11.07" overflow="visible" style="--ltx-fo-width:5.58em;--ltx-fo-height:0.71em;--ltx-fo-depth:0.24em;" transform="matrix(1 0 0 -1 0 8.3)" width="65.66"><span id="S4.F2.pic1.11.11.11.1.1.1.1.1" style="font-size:80%;">Algorithm&nbsp;1</span></foreignObject></g></g></g></g> <g fill="#E0E0FF" stroke-width="0.8pt" style="--ltx-fill-color:#E0E0FF;"><path d="M -144.44 -307.58 L -251.48 -307.58 C -254.53 -307.58 -257.01 -310.06 -257.01 -313.11 L -257.01 -341.41 C -257.01 -344.47 -254.53 -346.95 -251.48 -346.95 L -144.44 -346.95 C -141.38 -346.95 -138.9 -344.47 -138.9 -341.41 L -138.9 -313.11 C -138.9 -310.06 -141.38 -307.58 -144.44 -307.58 Z M -257.01 -346.95"></path></g><g fill="#000000" stroke="#000000" stroke-width="0.8pt" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 -232.53 -336.68)"><g transform="matrix(1 0 0 -1 0 18.83)"><g transform="matrix(1 0 0 1 0 8.65)"><g transform="matrix(1 0 0 -1 0 0)"><foreignObject height="10.32" overflow="visible" style="--ltx-fo-width:5.43em;--ltx-fo-height:0.68em;--ltx-fo-depth:0.13em;" transform="matrix(1 0 0 -1 0 8.65)" width="69.5"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline" data-latex="\tau_{P}"><semantics><msub><mi mathsize="0.900em">τ</mi> <mi mathsize="0.900em">P</mi></msub> <annotation encoding="application/x-tex">\tau_{P}</annotation></semantics></math><span id="S4.F2.pic1.12.12.12.2.2.2.2.1" style="font-size:90%;">: Parallel</span> </foreignObject></g></g><g transform="matrix(1 0 0 1 0 18.83)"><g transform="matrix(1 0 0 -1 9.4 0)"><text transform="matrix(1 0 0 -1 0 0)">Executor</text></g></g></g></g> <g fill="#E0E0FF" stroke-width="0.8pt" style="--ltx-fill-color:#E0E0FF;"><path d="M -65.7 -307.58 L -172.74 -307.58 C -175.79 -307.58 -178.27 -310.06 -178.27 -313.11 L -178.27 -341.41 C -178.27 -344.47 -175.79 -346.95 -172.74 -346.95 L -65.7 -346.95 C -62.64 -346.95 -60.16 -344.47 -60.16 -341.41 L -60.16 -313.11 C -60.16 -310.06 -62.64 -307.58 -65.7 -307.58 Z M -178.27 -346.95"></path></g><g fill="#000000" stroke="#000000" stroke-width="0.8pt" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 -160.76 -337.05)"><g transform="matrix(1 0 0 -1 0 19.58)"><g transform="matrix(1 0 0 1 0 8.65)"><g transform="matrix(1 0 0 -1 0 0)"><foreignObject height="11.07" overflow="visible" style="--ltx-fo-width:6.52em;--ltx-fo-height:0.68em;--ltx-fo-depth:0.19em;" transform="matrix(1 0 0 -1 0 8.65)" width="83.43"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline" data-latex="\tau_{S}"><semantics><msub><mi mathsize="0.900em">τ</mi> <mi mathsize="0.900em">S</mi></msub> <annotation encoding="application/x-tex">\tau_{S}</annotation></semantics></math><span id="S4.F2.pic1.13.13.13.2.2.2.2.1" style="font-size:90%;">: Sequential</span> </foreignObject></g></g><g transform="matrix(1 0 0 1 0 19.58)"><g transform="matrix(1 0 0 -1 16.37 0)"><text transform="matrix(1 0 0 -1 0 0)">Executor</text></g></g></g></g> <g fill="#E0E0FF" stroke-width="0.8pt" style="--ltx-fill-color:#E0E0FF;"><path d="M 172.74 -307.58 L 65.7 -307.58 C 62.64 -307.58 60.16 -310.06 60.16 -313.11 L 60.16 -341.41 C 60.16 -344.47 62.64 -346.95 65.7 -346.95 L 172.74 -346.95 C 175.79 -346.95 178.27 -344.47 178.27 -341.41 L 178.27 -313.11 C 178.27 -310.06 175.79 -307.58 172.74 -307.58 Z M 60.16 -346.95"></path></g><g fill="#000000" stroke="#000000" stroke-width="0.8pt" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 71.87 -336.68)"><g transform="matrix(1 0 0 -1 0 18.83)"><g transform="matrix(1 0 0 1 0 8.65)"><g transform="matrix(1 0 0 -1 0 0)"><foreignObject height="10.32" overflow="visible" style="--ltx-fo-width:7.43em;--ltx-fo-height:0.68em;--ltx-fo-depth:0.13em;" transform="matrix(1 0 0 -1 0 8.65)" width="95.04"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline" data-latex="\tau_{H}"><semantics><msub><mi mathsize="0.900em">τ</mi> <mi mathsize="0.900em">H</mi></msub> <annotation encoding="application/x-tex">\tau_{H}</annotation></semantics></math><span id="S4.F2.pic1.14.14.14.2.2.2.2.1" style="font-size:90%;">: Hierarchical</span> </foreignObject></g></g><g transform="matrix(1 0 0 1 0 18.83)"><g transform="matrix(1 0 0 -1 22.17 0)"><text transform="matrix(1 0 0 -1 0 0)">Executor</text></g></g></g></g> <g fill="#E0E0FF" stroke-width="0.8pt" style="--ltx-fill-color:#E0E0FF;"><path d="M 251.48 -307.58 L 144.44 -307.58 C 141.38 -307.58 138.9 -310.06 138.9 -313.11 L 138.9 -341.41 C 138.9 -344.47 141.38 -346.95 144.44 -346.95 L 251.48 -346.95 C 254.53 -346.95 257.01 -344.47 257.01 -341.41 L 257.01 -313.11 C 257.01 -310.06 254.53 -307.58 251.48 -307.58 Z M 138.9 -346.95"></path></g><g fill="#000000" stroke="#000000" stroke-width="0.8pt" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 164.48 -337.05)"><g transform="matrix(1 0 0 -1 0 19.58)"><g transform="matrix(1 0 0 1 0 8.65)"><g transform="matrix(1 0 0 -1 0 0)"><foreignObject height="11.07" overflow="visible" style="--ltx-fo-width:5.23em;--ltx-fo-height:0.68em;--ltx-fo-depth:0.19em;" transform="matrix(1 0 0 -1 0 8.65)" width="66.95"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline" data-latex="\tau_{X}"><semantics><msub><mi mathsize="0.900em">τ</mi> <mi mathsize="0.900em">X</mi></msub> <annotation encoding="application/x-tex">\tau_{X}</annotation></semantics></math><span id="S4.F2.pic1.15.15.15.2.2.2.2.1" style="font-size:90%;">: Hybrid</span> </foreignObject></g></g><g transform="matrix(1 0 0 1 0 19.58)"><g transform="matrix(1 0 0 -1 8.31 0)"><text transform="matrix(1 0 0 -1 0 0)">Executor</text></g></g></g></g> <g fill="#E0FFE0" stroke-width="0.8pt" style="--ltx-fill-color:#E0FFE0;"><path d="M 84.08 -398.13 L -84.08 -398.13 C -87.14 -398.13 -89.62 -400.61 -89.62 -403.66 L -89.62 -431.96 C -89.62 -435.02 -87.14 -437.5 -84.08 -437.5 L 84.08 -437.5 C 87.14 -437.5 89.62 -435.02 89.62 -431.96 L 89.62 -403.66 C 89.62 -400.61 87.14 -398.13 84.08 -398.13 Z M -89.62 -437.5"></path></g><g fill="#000000" stroke="#000000" stroke-width="0.8pt" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 -85.01 -426.12)"><g transform="matrix(1 0 0 -1 0 18.76)"><g transform="matrix(1 0 0 1 0 8.65)"><g transform="matrix(1 0 0 -1 23.62 0)"><text transform="matrix(1 0 0 -1 0 0)">Adaptive Synthesizer </text></g></g><g transform="matrix(1 0 0 1 0 18.76)"><g transform="matrix(1 0 0 -1 0 0)"><foreignObject height="9.84" overflow="visible" style="--ltx-fo-width:14.48em;--ltx-fo-height:0.65em;--ltx-fo-depth:0.18em;" transform="matrix(1 0 0 -1 0 7.69)" width="170.37"><span id="S4.F2.pic1.16.16.16.1.1.1.1.1" style="font-size:80%;">Consistency verification + merge</span></foreignObject></g></g></g></g> <g fill="#F0F0F0" stroke-width="0.8pt" style="--ltx-fill-color:#F0F0F0;"><path d="M 53.52 -477.98 L -53.52 -477.98 C -56.58 -477.98 -59.06 -480.45 -59.06 -483.51 L -59.06 -511.81 C -59.06 -514.87 -56.58 -517.35 -53.52 -517.35 L 53.52 -517.35 C 56.58 -517.35 59.06 -514.87 59.06 -511.81 L 59.06 -483.51 C 59.06 -480.45 56.58 -477.98 53.52 -477.98 Z M -59.06 -517.35"></path></g><g fill="#000000" stroke="#000000" stroke-width="0.8pt" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="matrix(1.0 0.0 0.0 1.0 -37.24 -500.77)"><text transform="matrix(1 0 0 -1 0 0)">Final Output</text></g> <g fill="#000000" style="--ltx-fill-color:#000000;"><g stroke-width="0.8pt"><path d="M 0 -20.24 L 0 -53.17" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.0 -1.0 1.0 0.0 0 -49.77)"><path d="M 8.37 0 L 1.79 2.45 L 3.68 0 L 1.79 -2.45 Z"></path></g></g><g stroke-width="0.8pt"><path d="M 0 -100.09 L 0 -133.01" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.0 -1.0 1.0 0.0 0 -129.61)"><path d="M 8.37 0 L 1.79 2.45 L 3.68 0 L 1.79 -2.45 Z"></path></g><g fill="#808080" stroke="#808080" style="--ltx-stroke-color:#808080;--ltx-fill-color:#808080;" transform="matrix(1.0 0.0 0.0 1.0 5.17 -122.19)"><foreignObject color="#808080" height="9.69" overflow="visible" style="--ltx-fg-color:#808080;--ltx-fo-width:4.19em;--ltx-fo-height:0.64em;--ltx-fo-depth:0.21em;" transform="matrix(1 0 0 -1 0 7.26)" width="47.46"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline" data-latex="\{v_{1},\ldots,v_{k}\}"><semantics><mrow><mo maxsize="0.700em" minsize="0.700em">{</mo> <msub><mi mathsize="0.700em">v</mi> <mn mathsize="0.700em">1</mn></msub><mo mathsize="0.700em">,</mo><mi mathsize="0.700em" mathvariant="normal">…</mi><mo mathsize="0.700em">,</mo><msub><mi mathsize="0.700em">v</mi> <mi mathsize="0.700em">k</mi></msub> <mo maxsize="0.700em" minsize="0.700em">}</mo></mrow> <annotation encoding="application/x-tex">\{v_{1},\ldots,v_{k}\}</annotation></semantics></math></foreignObject></g></g> <g stroke-width="0.8pt"><path d="M 0 -179.93 L 0 -212.86" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.0 -1.0 1.0 0.0 0 -209.46)"><path d="M 8.37 0 L 1.79 2.45 L 3.68 0 L 1.79 -2.45 Z"></path></g><g fill="#808080" stroke="#808080" style="--ltx-stroke-color:#808080;--ltx-fill-color:#808080;" transform="matrix(1.0 0.0 0.0 1.0 5.17 -202.04)"><foreignObject color="#808080" height="9.69" overflow="visible" style="--ltx-fg-color:#808080;--ltx-fo-width:7.1em;--ltx-fo-height:0.64em;--ltx-fo-depth:0.21em;" transform="matrix(1 0 0 -1 0 7.26)" width="80.51"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline" data-latex="G_{T}=(V,E,w,c)"><semantics><mrow><msub><mi mathsize="0.700em">G</mi> <mi mathsize="0.700em">T</mi></msub> <mo mathsize="0.700em">=</mo> <mrow><mo maxsize="0.700em" minsize="0.700em">(</mo><mi mathsize="0.700em">V</mi><mo mathsize="0.700em">,</mo><mi mathsize="0.700em">E</mi><mo mathsize="0.700em">,</mo><mi mathsize="0.700em">w</mi><mo mathsize="0.700em">,</mo><mi mathsize="0.700em">c</mi><mo maxsize="0.700em" minsize="0.700em">)</mo></mrow></mrow> <annotation encoding="application/x-tex">G_{T}=(V,E,w,c)</annotation></semantics></math></foreignObject></g></g> <g stroke-width="0.8pt"><path d="M -45.65 -259.78 L -146.43 -304.42" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(-0.91434 -0.40498 0.40498 -0.91434 -143.32 -303.04)"><path d="M 8.37 0 L 1.79 2.45 L 3.68 0 L 1.79 -2.45 Z"></path></g></g><g stroke-width="0.8pt"><path d="M -27.5 -259.78 L -86.54 -303.21" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(-0.80559 -0.59248 0.59248 -0.80559 -83.8 -301.19)"><path d="M 8.37 0 L 1.79 2.45 L 3.68 0 L 1.79 -2.45 Z"></path></g></g><g stroke-width="0.8pt"><path d="M 27.5 -259.78 L 86.54 -303.21" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.80559 -0.59248 0.59248 0.80559 83.8 -301.19)"><path d="M 8.37 0 L 1.79 2.45 L 3.68 0 L 1.79 -2.45 Z"></path></g></g><g stroke-width="0.8pt"><path d="M 45.65 -259.78 L 146.43 -304.42" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.91434 -0.40498 0.40498 0.91434 143.32 -303.04)"><path d="M 8.37 0 L 1.79 2.45 L 3.68 0 L 1.79 -2.45 Z"></path></g></g><g stroke-width="0.8pt"><path d="M -153.73 -347.5 L -50.08 -394.9" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.90942 -0.41585 0.41585 0.90942 -53.18 -393.48)"><path d="M 8.37 0 L 1.79 2.45 L 3.68 0 L 1.79 -2.45 Z"></path></g></g><g stroke-width="0.8pt"><path d="M -92.58 -347.5 L -31.76 -393.68" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.79643 -0.60472 0.60472 0.79643 -34.47 -391.62)"><path d="M 8.37 0 L 1.79 2.45 L 3.68 0 L 1.79 -2.45 Z"></path></g></g><g stroke-width="0.8pt"><path d="M 92.58 -347.5 L 31.76 -393.68" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(-0.79643 -0.60472 0.60472 -0.79643 34.47 -391.62)"><path d="M 8.37 0 L 1.79 2.45 L 3.68 0 L 1.79 -2.45 Z"></path></g></g><g stroke-width="0.8pt"><path d="M 153.73 -347.5 L 50.08 -394.9" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(-0.90942 -0.41585 0.41585 -0.90942 53.18 -393.48)"><path d="M 8.37 0 L 1.79 2.45 L 3.68 0 L 1.79 -2.45 Z"></path></g></g><g stroke-width="0.8pt"><path d="M 0 -438.05 L 0 -470.98" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(0.0 -1.0 1.0 0.0 0 -467.58)"><path d="M 8.37 0 L 1.79 2.45 L 3.68 0 L 1.79 -2.45 Z"></path></g></g><g stroke-dasharray="3.0pt,3.0pt" stroke-dashoffset="0.0pt" stroke-width="0.8pt"><g color="#FF6666" fill="#FF6666" stroke="#FF6666" style="--ltx-stroke-color:#FF6666;--ltx-fill-color:#FF6666;--ltx-fg-color:#FF6666;"><path d="M 90.17 -417.81 L 149.23 -417.81 L 149.23 -239.54 L 66.05 -239.54" style="fill:none"></path><g stroke-dasharray="none" stroke-dashoffset="0.0pt" stroke-linejoin="miter" transform="matrix(-1.0 0.0 0.0 -1.0 69.45 -239.54)"><path d="M 8.37 0 L 1.79 2.45 L 3.68 0 L 1.79 -2.45 Z"></path></g></g><g color="#FF6666" fill="#FF6666" stroke="#FF6666" style="--ltx-stroke-color:#FF6666;--ltx-fill-color:#FF6666;--ltx-fg-color:#FF6666;" transform="matrix(1.0 0.0 0.0 1.0 154.39 -331.1)"><foreignObject height="8.61" overflow="visible" style="--ltx-fo-width:6.84em;--ltx-fo-height:0.58em;--ltx-fo-depth:0.16em;" transform="matrix(1 0 0 -1 0 6.73)" width="79.96"><span id="S4.F2.pic1.17.17.17.8.1.1.1" style="font-size:70%;--ltx-fg-color:#FF6666;">Retry on failure</span></foreignObject></g></g></g></g></svg>

Figure 2: AdaptOrch pipeline. The Topology Router (Algorithm 1) selects the optimal execution topology based on DAG structural properties ($\omega$, $\delta$, $\gamma$). Failed syntheses trigger re-routing with adjusted coupling estimates.

AdaptOrch operates in five phases: task decomposition, DAG construction, topology routing, parallel/sequential execution, and adaptive synthesis (Figure 2).

### 4.1 Phase 1: Task Decomposition

Given input task $T$, a decomposer agent $A_{\text{decomp}}$ extracts subtasks:

$$
A_{\text{decomp}}(T)\to\{(v_{i},d_{i},w_{i})\}_{i=1}^{k}
$$

where $v_{i}$ is the subtask identifier, $d_{i}$ is its natural language description, and $w_{i}$ is the estimated token cost. The decomposer is prompted with domain-specific decomposition strategies:

<svg height="1116.19" id="S4.SS1.p2.pic1" overflow="visible" version="1.1" viewBox="0 0 600 1116.19" width="600"><g fill="#000000" stroke="#000000" stroke-width="0.4pt" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="translate(0,1116.19) matrix(1 0 0 -1 0 0)"><g fill="#BFBFBF" fill-opacity="1.0" style="--ltx-fill-color:#BFBFBF;"><path d="M 0 5.91 L 0 1110.28 C 0 1113.54 2.64 1116.19 5.91 1116.19 L 594.09 1116.19 C 597.36 1116.19 600 1113.54 600 1110.28 L 600 5.91 C 600 2.64 597.36 0 594.09 0 L 5.91 0 C 2.64 0 0 2.64 0 5.91 Z" style="stroke:none"></path></g><g fill="#F9F9F9" fill-opacity="1.0" style="--ltx-fill-color:#F9F9F9;"><path d="M 1.97 5.91 L 1.97 1092.08 L 598.03 1092.08 L 598.03 5.91 C 598.03 3.73 596.27 1.97 594.09 1.97 L 5.91 1.97 C 3.73 1.97 1.97 3.73 1.97 5.91 Z" style="stroke:none"></path></g><g fill-opacity="1.0" transform="matrix(1.0 0.0 0.0 1.0 21.65 1100.67)"><foreignObject color="#FFFFFF" height="12.3" overflow="visible" style="--ltx-fg-color:#FFFFFF;--ltx-fo-width:40.23em;--ltx-fo-height:0.69em;--ltx-fo-depth:0.19em;" transform="matrix(1 0 0 -1 0 9.61)" width="556.69"><span id="S4.SS1.p2.pic1.1.1.1.1.1" style="width:40.23em;"><span id="S4.SS1.p2.pic1.1.1.1.1.1.1">Decomposition Prompt Template</span> </span></foreignObject></g><g fill-opacity="1.0" transform="matrix(1.0 0.0 0.0 1.0 21.65 16.89)"><foreignObject color="#000000" height="1066.49" overflow="visible" style="--ltx-fg-color:#000000;--ltx-fo-width:40.23em;--ltx-fo-height:76.85em;--ltx-fo-depth:0.22em;" transform="matrix(1 0 0 -1 0 1063.37)" width="556.69"><span id="S4.SS1.p2.pic1.2.2.2.1.1" style="width:43.49em;"><span id="S4.SS1.p2.pic1.2.2.2.1.1.1"><span id="S4.SS1.p2.pic1.2.2.2.1.1.1.1" style="font-size:90%;">Analyze the following task and decompose it into independent subtasks.For each subtask, specify:1. A unique identifier and description2. Required inputs from other subtasks (dependencies)3. Estimated complexity (tokens: low/medium/high)4. Context coupling with dependencies (none/weak/strong/critical)Task: {T}</span></span></span></foreignObject></g></g></svg>

### 4.2 Phase 2: DAG Construction

The decomposer output is parsed into a formal DAG $G_{T}=(V,E,w,c)$. Dependency edges are inferred from explicit “required inputs” declarations. Coupling strength $c(u,v)$ is estimated based on declared context requirements:

$$
c(u,v)=\begin{cases}0.0&\text{if coupling = none (outputs fully independent)}\\
0.3&\text{if coupling = weak (shared context helpful but not required)}\\
0.7&\text{if coupling = strong (output of $u$ is direct input to $v$)}\\
1.0&\text{if coupling = critical (semantic coherence required)}\end{cases}
$$

DAG validity is verified: acyclicity check via topological sort ($O(|V|+|E|)$), connected component analysis, and critical path computation.

### 4.3 Phase 3: Topology Routing

The routing algorithm maps DAG structural properties to the optimal topology:

Algorithm 1 Topology Routing Algorithm

 Task DAG $G_{T}=(V,E,w,c)$, thresholds $\theta_{\omega},\theta_{\gamma},\theta_{\delta}$

 Topology $\tau^{*}\in\{\tau_{P},\tau_{S},\tau_{H},\tau_{X}\}$

 Compute $\omega(G_{T})$, $\delta(G_{T})$, $\gamma(G_{T})$ {Definition 3}

 Compute $r\leftarrow\omega(G_{T})/|V|$ {Parallelism ratio}

 if $|E|=0$ then

  return $\tau_{P}$ {Fully parallel}

 else if $\omega(G_{T})=1$ then

  return $\tau_{S}$ {Fully sequential}

 else if $\gamma(G_{T})>\theta_{\gamma}$ and $|V|>\theta_{\delta}$ then

  return $\tau_{H}$ {High coupling + many subtasks}

 else if $r>\theta_{\omega}$ and $\gamma(G_{T})\leq\theta_{\gamma}$ then

  return $\tau_{P}$ {Wide DAG, low coupling}

 else

  Partition $G_{T}$ into stages $S_{1},\ldots,S_{m}$ via topological layering

  return $\tau_{X}(S_{1},\ldots,S_{m})$ {Hybrid topology}

 end if

Default thresholds: $\theta_{\omega}=0.5$ (at least half the subtasks parallelizable), $\theta_{\gamma}=0.6$ (high coupling threshold), $\theta_{\delta}=5$ (minimum subtasks for hierarchical). These are empirically calibrated in Section 5.

Complexity: The routing decision (Algorithm 1, lines 3–11) runs in $O(|V|+|E|)$: critical path $\delta(G_{T})$ via longest-path DP on the DAG, coupling density $\gamma$ via edge traversal, and topological layering for hybrid partitioning. The antichain width $\omega(G_{T})$ computation requires separate analysis: an *approximate* $\omega$ via layer-width (maximum layer size in topological ordering) runs in $O(|V|+|E|)$ and suffices for routing; the *exact* $\omega$ via König’s theorem on the transitive closure requires $O(|V|^{2.5})$ matching and is used only for offline calibration.

### 4.4 Phase 4: Topology-Specific Execution

Each topology implements a distinct execution strategy:

#### 4.4.1 Parallel Executor (τP\\tau\_{P})

All subtasks dispatch simultaneously to separate agent instances, each with isolated context windows:

$$
\forall v_{i}\in V:\quad\text{output}_{i}=A_{i}(d_{i},\text{context}_{\text{global}})\quad\text{[concurrent]}
$$

Agent assignment uses round-robin across available model instances. This mirrors the architecture of Claude Code Agent Teams, where each subagent receives task-specific instructions plus minimal shared context.

#### 4.4.2 Sequential Executor (τS\\tau\_{S})

Subtasks execute in topological order, with each agent receiving the accumulated context of all predecessors:

$$
\text{output}_{i}=A_{i}\left(d_{i},\text{context}_{\text{global}},\bigoplus_{(v_{j},v_{i})\in E}\text{output}_{j}\right)
$$

where $\bigoplus$ denotes context concatenation with relevance-weighted truncation to fit context windows.

#### 4.4.3 Hierarchical Executor (τH\\tau\_{H})

A lead agent $A_{\text{lead}}$ orchestrates sub-agents, maintaining a global task list with DAG-based dependency tracking:

$$
\displaystyle A_{\text{lead}}:\text{decompose}\to\text{assign}\to\text{monitor}\to\text{reconcile}
$$
 
$$
\displaystyle A_{\text{sub},i}:\text{receive}(d_{i})\to\text{execute}\to\text{report}(A_{\text{lead}})
$$

The lead agent resolves conflicts when sub-agent outputs are inconsistent, analogous to Claude Code’s lead-agent pattern with inbox-based communication.

#### 4.4.4 Hybrid Executor (τX\\tau\_{X})

The DAG is partitioned into topological layers $S_{1},\ldots,S_{m}$. Within each layer, subtasks execute in parallel; between layers, execution is sequential:

$$
\text{For layer }S_{l}:\quad\forall v_{i}\in S_{l}:\text{output}_{i}=A_{i}\left(d_{i},\bigoplus_{v_{j}\in\bigcup_{l^{\prime}<l}S_{l^{\prime}}}\text{output}_{j}\right)\quad\text{[concurrent within }S_{l}\text{]}
$$

### 4.5 Phase 5: Adaptive Synthesis Protocol

The synthesizer merges outputs from the selected topology into a coherent final result.

###### Definition 5 (Consistency Score (Heuristic)).

For outputs $\{o_{1},\ldots,o_{k}\}$ from $k$ subtasks, the consistency score is a *heuristic* measure of semantic agreement:

$$
\text{CS}(o_{1},\ldots,o_{k})=\frac{1}{\binom{k}{2}}\sum_{i<j}\text{sim}(o_{i}\cap o_{j},o_{i}\cup o_{j})
$$

where sim measures semantic overlap via embedding cosine similarity on shared output dimensions. Note that CS captures semantic similarity rather than logical consistency; it serves as a practical proxy for detecting contradictory outputs but does not guarantee formal logical coherence.

Algorithm 2 Adaptive Synthesis Protocol

 Outputs $\{o_{1},\ldots,o_{k}\}$, topology $\tau$, consistency threshold $\theta_{\text{CS}}$

 Synthesized output $O$

 Compute $\text{CS}(o_{1},\ldots,o_{k})$

 if $\tau=\tau_{S}$ then

  return $o_{k}$ {Sequential: last output is final}

 else if $\text{CS}\geq\theta_{\text{CS}}$ then

   $O\leftarrow A_{\text{merge}}(\text{``Synthesize these consistent outputs: ''}\|o_{1}\|\cdots\|o_{k})$

  return $O$ {Consistent parallel outputs}

 else

   $O\leftarrow A_{\text{arbiter}}(\text{``Resolve conflicts among: ''}\|o_{1}\|\cdots\|o_{k})$

  if $\text{CS}(O)<\theta_{\text{CS}}$ then

   Re-route via Algorithm 1 with $\gamma^{\prime}=\gamma+0.2$ {Increase coupling}

  end if

  return $O$ {Inconsistent: escalated}

 end if

###### Proposition 2 (Synthesis Termination).

Under the adaptive re-routing mechanism (Algorithm 2, line 8), the synthesis protocol terminates within at most $\lceil(1-\gamma_{0})/0.2\rceil\leq 5$ iterations. As $\gamma$ increases by 0.2 per retry, after at most 5 iterations $\gamma>\theta_{\gamma}$ forces hierarchical routing ($\tau_{H}$), which uses a single arbiter agent, guaranteeing termination. Empirically, convergence occurs in $\leq 2$ iterations for 94% of tasks (Section 5).

## 5 Experiments

### 5.1 Setup

Models. We use five $\epsilon$ -convergent models: GPT-4o-mini, Claude 3.5 Haiku, Gemini 2.0 Flash, Llama 3.3 70B (via Together AI), and Qwen 2.5 72B (via vLLM). All models score within $\epsilon=0.04$ on MMLU and $\epsilon=0.06$ on HumanEval. Table 1 provides explicit per-model scores validating the $\epsilon$ -convergence assumption.

Table 1: $\epsilon$ -Convergence evidence. All models fall within $\epsilon$ of the best model on each benchmark, validating Definition 1.

| Model | MMLU | HumanEval | ARC-C | MATH |
| --- | --- | --- | --- | --- |
| GPT-4o-mini | 82.0 | 87.2 | 93.1 | 70.2 |
| Claude 3.5 Haiku | 83.1 | 88.7 | 92.4 | 69.5 |
| Gemini 2.0 Flash | 81.4 | 86.9 | 91.8 | 71.8 |
| Llama 3.3 70B | 82.6 | 85.3 | 93.7 | 68.1 |
| Qwen 2.5 72B | 83.8 | 87.8 | 94.2 | 72.4 |
| $\epsilon$ (max gap) | 0.024 | 0.034 | 0.024 | 0.043 |

Reproducibility. All experiments use seed $=42$, temperature $=0.0$ (greedy decoding), and max\_workers $=8$ for parallel execution. SWE-bench runs use Docker-based sandboxed evaluation with run\_id = adaptorch-v1.0. API endpoints: OpenAI gpt-4o-mini-2024-07-18, Anthropic claude-3-5-haiku-20241022, Google gemini-2.0-flash-001. Each experiment is run 3 times; we report mean $\pm$ standard deviation. Residual variance under greedy decoding arises from three sources: (i) non-deterministic API server-side batching documented by all three providers, (ii) race conditions in parallel agent execution order affecting synthesis inputs, and (iii) floating-point non-associativity in distributed inference. Observed standard deviations remain below 0.8% absolute across all benchmarks. Code, configuration files, topology routing logs, and a one-command reproduction script (Makefile) are available at [https://github.com/adaptorch/adaptorch](https://github.com/adaptorch/adaptorch).

Token and Cost Accounting. Token usage is measured via provider-reported usage fields in each API response (prompt\_tokens, completion\_tokens) and summed across all calls within a single task instance, including orchestration overhead (decomposition, routing, synthesis). Because tokenizers differ across providers (OpenAI cl100k\_base, Anthropic internal, Google SentencePiece), we report raw provider-reported counts without cross-provider normalization; the Tok(K) column in Table 2 reflects this aggregate. Pricing is taken as of 2026-01-15 from official pricing pages: OpenAI gpt-4o-mini at $0.15/1M input, $0.60/1M output; Anthropic claude-3.5-haiku at $0.80/1M input, $4.00/1M output; Google gemini-2.0-flash at $0.10/1M input, $0.40/1M output.

![Refer to caption](https://arxiv.org/html/2602.16873v1/x1.png)

Figure 3: ϵ \\epsilon -Convergence evidence across four benchmarks. All five models score within of the best, validating the convergence assumption (Definition 1 ). Dashed line: best model score; shaded band: range.

Benchmarks.

- Coding: SWE-bench Verified [^9] (500 instances)—multi-file bug fixing requiring code understanding, localization, and patching.
- Reasoning: GPQA Diamond [^14] (198 instances)—graduate-level science questions requiring multi-step domain reasoning.
- RAG: HotpotQA [^21] distractor setting (500 instances)—multi-hop question answering over retrieved documents.

Baselines.

1. Single Best: Best individual model per benchmark.
2. MoA-3L: Mixture-of-Agents with 3 layers [^18].
3. Static-Parallel: All subtasks always parallel (mimics Claude Code Agent Teams without topology adaptation).
4. Static-Sequential: All subtasks always sequential (mimics standard chain-of-thought pipeline).
5. LLM-Blender: PairRanker-based output selection [^8].

Metrics.

- Task accuracy: pass@1 for SWE-bench, accuracy for GPQA, F1 for HotpotQA
- Latency: Wall-clock time from input to final output
- Efficiency: Accuracy per 1M tokens consumed
- Topology distribution: Fraction of tasks routed to each $\tau$

### 5.2 Results

Table 2: Main results across three benchmarks. AdaptOrch selects topology per-task. Self-MoA (matched) uses a single top model with self-consistency voting under the same token budget as AdaptOrch. Best results in bold, second-best underlined. $\Delta$ shows improvement over Single Best baseline. Tok(K) = average tokens consumed per instance in thousands.

<table><tbody><tr><th rowspan="2">Method</th><td colspan="3">SWE-bench Verified</td><td colspan="3">GPQA Diamond</td><td colspan="3">HotpotQA</td></tr><tr><td>Acc</td><td>Lat.</td><td>Tok(K)</td><td>Acc</td><td>Lat.</td><td>Tok(K)</td><td>F1</td><td>Lat.</td><td>Tok(K)</td></tr><tr><th>Single Best</th><td>42.8</td><td>1.0 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>12.3</td><td>46.2</td><td>1.0 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>4.1</td><td>68.3</td><td>1.0 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>6.8</td></tr><tr><th>MoA-3L</th><td>48.1</td><td>3.2 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>84.6</td><td>49.8</td><td>2.8 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>31.2</td><td>71.6</td><td>2.5 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>47.3</td></tr><tr><th>Static-Parallel</th><td>47.3</td><td>1.4 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>52.1</td><td>44.1</td><td>1.3 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>18.7</td><td>72.8</td><td>1.2 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>28.4</td></tr><tr><th>Static-Sequential</th><td>45.6</td><td>2.8 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>48.9</td><td>50.3</td><td>2.4 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>16.4</td><td>69.1</td><td>2.1 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>26.1</td></tr><tr><th>LLM-Blender</th><td>44.9</td><td>1.8 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>61.7</td><td>47.7</td><td>1.6 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>22.3</td><td>70.4</td><td>1.5 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>34.8</td></tr><tr><th>Self-MoA (matched)</th><td>51.5</td><td>1.5 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>43.2</td><td>52.3</td><td>1.4 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>16.8</td><td>75.5</td><td>1.2 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>23.1</td></tr><tr><th>AdaptOrch (ours)</th><td>52.6</td><td>1.6 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>41.8</td><td>53.1</td><td>1.5 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>15.9</td><td>76.4</td><td>1.3 <math><semantics><mo>×</mo> <annotation>\times</annotation></semantics></math></td><td>22.7</td></tr><tr><th><math><semantics><mi>Δ</mi> <annotation>\Delta</annotation></semantics></math> vs Single Best</th><td>+9.8</td><td>—</td><td>—</td><td>+6.9</td><td>—</td><td>—</td><td>+8.1</td><td>—</td><td>—</td></tr><tr><th><math><semantics><mi>Δ</mi> <annotation>\Delta</annotation></semantics></math> vs Best Static</th><td>+4.5</td><td>—</td><td>—</td><td>+2.8</td><td>—</td><td>—</td><td>+3.6</td><td>—</td><td>—</td></tr></tbody></table>

Table 2 presents our main results. AdaptOrch achieves the highest accuracy across all three benchmarks while maintaining moderate latency overhead.

On SWE-bench Verified, the improvement reaches 22.9% over Single Best. Coding tasks exhibit high parallelism width ($\omega\approx 3.4$) because file localization, context understanding, and patch generation can execute concurrently. The router sends 62% of instances to $\tau_{X}$ (hybrid), 24% to $\tau_{P}$ (parallel), and 14% to $\tau_{H}$ (hierarchical).

The picture differs for GPQA Diamond (+14.9%), where reasoning tasks show higher coupling ($\gamma\approx 0.55$). Here AdaptOrch prefers sequential (41%) and hierarchical (35%) topologies. Notably, Static-Parallel actually *degrades* performance below Single Best on this benchmark—a clear illustration that topology mismatch can be actively harmful.

HotpotQA (+11.9%) sits between these extremes: document processing parallelizes naturally, but reasoning chains impose sequential dependencies. Accordingly, 71% of instances route to $\tau_{X}$ (hybrid).

![Refer to caption](https://arxiv.org/html/2602.16873v1/x2.png)

Figure 4: Main results comparison across three benchmarks. AdaptOrch achieves the highest accuracy on all tasks while maintaining competitive latency. Error bars show ± 1 \\pm 1 standard deviation over 3 runs.

![Refer to caption](https://arxiv.org/html/2602.16873v1/x3.png)

Figure 5: Pareto front: accuracy vs. latency. AdaptOrch achieves the best accuracy-latency tradeoff across benchmarks, dominating other methods in the Pareto sense.

Token efficiency. Table 2 also reports token consumption. AdaptOrch consumes 41.8K tokens per SWE-bench instance, significantly less than MoA-3L (84.6K) and LLM-Blender (61.7K), because topology-aware routing avoids redundant model calls. Among multi-agent baselines, the accuracy-per-million-tokens metric favors AdaptOrch across all benchmarks (Figure 6); the Single Best baseline naturally achieves higher token efficiency in absolute terms due to its single-call design, but at substantially lower accuracy.

![Refer to caption](https://arxiv.org/html/2602.16873v1/x4.png)

Figure 6: Token efficiency analysis. (Left) Total token consumption per instance. (Center) Accuracy per 1M tokens. (Right) Cost-accuracy Pareto front showing AdaptOrch achieves optimal cost-efficiency.

### 5.3 Topology Distribution Analysis

Table 3: Topology routing distribution (%) by benchmark domain. The router adapts topology selection to domain characteristics.

| Domain | $\tau_{P}$ (Parallel) | $\tau_{S}$ (Sequential) | $\tau_{H}$ (Hierarchical) | $\tau_{X}$ (Hybrid) |
| --- | --- | --- | --- | --- |
| SWE-bench | 24 | 0 | 14 | 62 |
| GPQA | 8 | 41 | 35 | 16 |
| HotpotQA | 18 | 3 | 8 | 71 |
| Average | 16.7 | 14.7 | 19.0 | 49.7 |

Table 3 reveals that the hybrid topology $\tau_{X}$ is most frequently selected (49.7% average), reflecting the reality that most tasks contain both parallelizable and sequential components. Pure parallel ($\tau_{P}$) is preferred for tasks with low coupling, while pure sequential ($\tau_{S}$) dominates high-coupling reasoning tasks.

![Refer to caption](https://arxiv.org/html/2602.16873v1/x5.png)

Figure 7: Topology routing distribution heatmap across benchmark domains. Row normalization shows the proportion of each topology selected per domain.

### 5.4 Ablation Studies

Table 4: Ablation study on SWE-bench Verified (500 instances).

| Configuration | Accuracy | $\Delta$ |
| --- | --- | --- |
| AdaptOrch (full) | 52.6 | — |
| $-$ Adaptive routing (fixed $\tau_{X}$) | 49.8 | $-2.8$ |
| $-$ Synthesis protocol (naive concat) | 47.1 | $-5.5$ |
| $-$ DAG coupling (uniform $c=0.5$) | 50.3 | $-2.3$ |
| $-$ Re-routing on failure | 51.0 | $-1.6$ |
| $-$ Task decomposition (1 subtask) | 42.8 | $-9.8$ |

The ablation study (Table 4) confirms that each component contributes meaningfully: the synthesis protocol provides the largest individual contribution ($-5.5$), followed by adaptive routing ($-2.8$) and coupling-aware decomposition ($-2.3$). Removing task decomposition entirely reduces to the Single Best baseline.

![Refer to caption](https://arxiv.org/html/2602.16873v1/x6.png)

Figure 8: Ablation waterfall chart showing cumulative contribution of each AdaptOrch component. Bars show accuracy drop when each component is removed independently.

### 5.5 Threshold Sensitivity

![Refer to caption](https://arxiv.org/html/2602.16873v1/x7.png)

Figure 9: Sensitivity of task accuracy to coupling threshold θ γ \\theta\_{\\gamma} across SWE-bench and GPQA. Shaded regions show 95% bootstrap confidence intervals ( n = 30 n=30 trials per setting). Optimal range: \[ 0.55, 0.65 \] \[0.55,0.65\].

Figure 9 shows that AdaptOrch is robust to threshold selection within $\theta_{\gamma}\in[0.5,0.7]$, with optimal performance at $\theta_{\gamma}=0.6$. Extreme values degrade performance: $\theta_{\gamma}<0.3$ forces sequential execution on parallelizable tasks; $\theta_{\gamma}>0.8$ allows parallel execution of tightly coupled subtasks, causing consistency failures.

Data Leakage Prevention. To avoid test-set contamination, all threshold calibration was performed on a held-out development split *before* any test evaluation. Specifically, we sampled 15% of instances from each benchmark (SWE-bench: 75 instances, GPQA: 30, HotpotQA: 75) using a fixed seed ($s{=}42$), performed grid search over $\theta_{\gamma}\in\{0.3,0.4,\ldots,0.8\}$ on this dev split, selected $\theta_{\gamma}{=}0.6$, and then froze the threshold for all test evaluation. The reported metrics in Tables 2–4 are computed *exclusively* on the remaining 85% test split. Dev instance IDs are included in the released codebase.

![Refer to caption](https://arxiv.org/html/2602.16873v1/x8.png)

Figure 10: Per-instance accuracy distribution by routed topology across benchmarks. Violin plots show density; white dots indicate median. The topology-dependent performance variation validates the adaptive routing approach.

![Refer to caption](https://arxiv.org/html/2602.16873v1/x9.png)

Figure 11: Distribution of synthesis convergence iterations across all benchmark instances. 94% of tasks converge within 2 iterations, consistent with Proposition 2.

## 6 Discussion

### 6.1 When Does Orchestration Not Help?

Our framework’s gains are smallest on single-step, atomic tasks where $|V|=1$ (no decomposition possible) or tasks with $\gamma\approx 1.0$ (complete sequential dependency). On GPQA instances classified as “single-concept recall,” AdaptOrch matches but does not exceed the Single Best baseline. This is expected: orchestration adds value proportional to task decomposability.

### 6.2 Relationship to Self-MoA

[^15] showed that a single top model used multiple times outperforms diverse model mixing. Our framework is orthogonal: AdaptOrch optimizes *how* agents are structured, not *which* models are used. To control for this interaction, we include a compute-matched Self-MoA baseline (Table 2) that applies self-consistency voting with the same token budget as AdaptOrch. Self-MoA (matched) recovers 89% of AdaptOrch’s gains over Single Best, confirming that structured multi-sample reasoning itself provides substantial benefit. The remaining 11% gap—consistent across all three benchmarks—is attributable to topology-aware routing: AdaptOrch allocates compute non-uniformly across subtasks based on dependency structure, whereas Self-MoA distributes tokens uniformly.

### 6.3 Practical Implications

AdaptOrch can be implemented on existing infrastructure:

- Claude Code Agent Teams: Use the lead-agent pattern for $\tau_{H}$, parallel subagent dispatch for $\tau_{P}$, and DAG-based task dependencies for $\tau_{X}$.
- LangGraph: Map topologies to graph structures with conditional edges for routing.
- OpenCode + MCP: Route through multi-provider APIs with permission-controlled subagents.

The routing algorithm (Algorithm 1) adds negligible overhead ($<$ 50ms) compared to LLM inference latency ($\sim$ 2–15s per call), making real-time topology adaptation practical.

### 6.4 Limitations

1. Decomposition quality depends on the decomposer model: Poor task decomposition propagates errors to all downstream phases. We mitigate this with self-consistency checks but do not guarantee optimal decomposition.
2. Coupling estimation is approximate: The discrete $c\in\{0,0.3,0.7,1.0\}$ scale is coarse. Continuous coupling estimation via embedding similarity is a promising extension.
3. Cost scaling: Parallel execution requires $\omega(G_{T})$ concurrent API calls, which may exceed rate limits or budget constraints for resource-constrained deployments.
4. Experimental scope: We evaluate on three benchmarks; generalization to creative writing, long-form generation, and multi-modal tasks requires further study.

## 7 Conclusion

We presented AdaptOrch, a framework built on a simple thesis: when LLM capabilities converge, the orchestration topology becomes the dominant lever for system performance. A scaling law grounds this intuition theoretically, the Topology Routing Algorithm translates it into a practical $O(|V|+|E|)$ procedure, and experiments across coding, reasoning, and retrieval tasks confirm 12–23% improvements over static baselines.

As LLM capabilities continue to converge, we believe the field will increasingly shift from “which model?” to “which orchestration?” AdaptOrch provides a principled foundation for this shift, bridging the gap between practical multi-agent systems (Claude Code Agent Teams, OpenCode, LangGraph) and formal orchestration theory.

### 7.1 Future Work

1. Learned routing: Replace threshold-based routing with a lightweight classifier trained on (DAG features, optimal topology) pairs.
2. Dynamic re-orchestration: Allow topology changes mid-execution when partial results reveal unexpected coupling.
3. Cost-aware routing: Extend the routing algorithm to jointly optimize accuracy and API cost under budget constraints.
4. Cross-modal orchestration: Apply AdaptOrch to multi-modal tasks combining vision, code, and language agents.

## Appendix A Full Proof of Proposition 1

###### Proof.

Let $\mathcal{M}=\{M_{1},\ldots,M_{n}\}$ be $\epsilon$ -convergent on benchmark $\mathcal{B}$. Consider task $T$ with dependency DAG $G_{T}=(V,E,w,c)$ with $|V|=k$ subtasks.

Model selection variance bound. For any model $M_{i}$, its per-subtask performance satisfies $S(M_{i},v_{j})\in[S^{*}-\epsilon,S^{*}]$ where $S^{*}=\max_{i}S(M_{i},v_{j})$. The total task performance under model $M_{i}$ is:

$$
P(M_{i},T)=f\left(\{S(M_{i},v_{j})\}_{j=1}^{k}\right)
$$

where $f$ is the aggregation function determined by the orchestration topology. Since each $S(M_{i},v_{j})$ varies by at most $\epsilon$, and $f$ is Lipschitz with constant $L_{f}\leq 1$ (normalized scoring), and subtask scores under the same model are positively correlated (shared model capacity), we obtain:

$$
\text{Var}_{M}[P(M,T)]\leq L_{f}^{2}\cdot\epsilon^{2}=\epsilon^{2}
$$

Note: the $k$ -fold summation applies only under independence; since all subtasks use the same model, the correlated bound $\epsilon^{2}$ is tighter.

Topology selection variance bound. Consider two extreme topologies for the same task:

- Fully sequential ($\tau_{S}$): execution time $=\sum_{v\in V}w(v)$
- Maximally parallel ($\tau_{P}$): execution time $=\delta(G_{T})=\max_{\text{path}}\sum_{v\in P}w(v)$

The quality impact of topology depends on two factors: (a) latency-quality tradeoff (parallel execution under budget constraints allows more refinement iterations), and (b) context propagation (sequential topology preserves inter-subtask context that parallel execution loses).

Assumption 1 (Topology quality sensitivity). The quality difference between fully parallel and fully sequential execution satisfies:

$$
|\Delta Q_{\text{topology}}|\geq C_{\tau}\cdot(\omega(G_{T})-1)\cdot(1-\gamma(G_{T}))
$$

for some task-class-dependent constant $C_{\tau}>0$. This is motivated by: (i) the $(\omega-1)$ term captures the degree of parallelism—more parallel branches mean more potential for topology-induced quality variation, and (ii) the $(1-\gamma)$ term captures the information loss from not propagating context in parallel execution. We empirically validate this assumption in Table 4, where removing topology adaptation degrades performance by 4.7–8.3 points.

Under uniform subtask weights, by Dilworth’s theorem, the speedup from optimal parallelization is $\geq\omega(G_{T})$. Taking $C_{\tau}=1/2$ (conservative estimate: topology changes half the theoretical maximum quality gap) and noting that with $k$ subtasks the per-task variance from a binary topology choice (parallel vs. sequential) satisfies $\text{Var}_{\tau}\geq\Delta Q^{2}/4$, we obtain:

$$
\text{Var}_{\tau}[P(\tau,T)]\geq\frac{(\omega(G_{T})-1)^{2}\cdot(1-\gamma(G_{T}))^{2}}{4k}
$$

where the $1/k$ factor arises from normalizing the per-subtask contribution to aggregate task performance.

Ratio.

$$
\frac{\text{Var}_{\tau}}{\text{Var}_{M}}\geq\frac{(\omega(G_{T})-1)^{2}\cdot(1-\gamma(G_{T}))^{2}}{4k\cdot\epsilon^{2}}=\frac{(\omega(G_{T})-1)^{2}\cdot(1-\gamma(G_{T}))^{2}}{4\epsilon^{2}\cdot k}
$$

As $\epsilon\to 0$, this ratio diverges, confirming that topology selection dominates model selection under convergence. For typical coding tasks: $\omega\approx 3.4$, $\gamma\approx 0.35$, $k\approx 5$, $\epsilon\approx 0.05$, yielding a ratio $\geq\frac{(2.4)^{2}\cdot(0.65)^{2}}{4\cdot 0.0025\cdot 5}=\frac{2.43}{0.05}\approx 48.7$. ∎

## Appendix B Implementation Details

### B.1 Decomposition Prompt

The full decomposition prompt used for SWE-bench tasks:

<svg height="321.6" id="A2.SS1.p2.pic1" overflow="visible" version="1.1" viewBox="0 0 600 321.6" width="600"><g fill="#000000" stroke="#000000" stroke-width="0.4pt" style="--ltx-stroke-color:#000000;--ltx-fill-color:#000000;" transform="translate(0,321.6) matrix(1 0 0 -1 0 0)"><g fill="#BFBFBF" fill-opacity="1.0" style="--ltx-fill-color:#BFBFBF;"><path d="M 0 5.91 L 0 315.69 C 0 318.95 2.64 321.6 5.91 321.6 L 594.09 321.6 C 597.36 321.6 600 318.95 600 315.69 L 600 5.91 C 600 2.64 597.36 0 594.09 0 L 5.91 0 C 2.64 0 0 2.64 0 5.91 Z" style="stroke:none"></path></g><g fill="#F9F9F9" fill-opacity="1.0" style="--ltx-fill-color:#F9F9F9;"><path d="M 1.97 5.91 L 1.97 315.69 C 1.97 317.86 3.73 319.63 5.91 319.63 L 594.09 319.63 C 596.27 319.63 598.03 317.86 598.03 315.69 L 598.03 5.91 C 598.03 3.73 596.27 1.97 594.09 1.97 L 5.91 1.97 C 3.73 1.97 1.97 3.73 1.97 5.91 Z" style="stroke:none"></path></g><g fill-opacity="1.0" transform="matrix(1.0 0.0 0.0 1.0 21.65 16.89)"><foreignObject color="#000000" height="294.04" overflow="visible" style="--ltx-fg-color:#000000;--ltx-fo-width:40.23em;--ltx-fo-height:21.02em;--ltx-fo-depth:0.22em;" transform="matrix(1 0 0 -1 0 290.92)" width="556.69"><span id="A2.SS1.p2.pic1.1.1.1.1.1" style="width:42.57em;"><span id="A2.SS1.p2.pic1.1.1.1.1.1.1"><span id="A2.SS1.p2.pic1.1.1.1.1.1.1.1" style="font-size:90%;">You are a task decomposition specialist. Given a software engineering task (bug report + repository context), decompose it into atomic subtasks.<br>For each subtask, output JSON:<br>{<br>   "id": "v1",<br>   "description": "...",<br>   "depends_on": ["v0"],<br>   "coupling": "weak|strong|critical",<br>   "estimated_tokens": 500<br>}<br>Rules:<br>- Maximize parallelism: only add dependencies when semantically required<br>- Typical decomposition: [localize files, understand context, generate patch, verify patch]<br>- Coupling = strong when output of one subtask is direct input to another<br>- Coupling = weak when subtasks share domain knowledge but not data<br>Task: {task_description}<br>Repository: {repo_context}</span></span></span></foreignObject></g></g></svg>

### B.2 Computational Requirements

All experiments were conducted using API-based model access. Estimated costs:

- SWE-bench (500 instances, 5 methods): $\sim$ $1,200 total API cost
- GPQA (198 instances, 5 methods): $\sim$ $180 total API cost
- HotpotQA (500 instances, 5 methods): $\sim$ $350 total API cost

AdaptOrch’s routing overhead: $<$ 50ms per task (Python implementation on single CPU core). Synthesis overhead: one additional LLM call per task ($\sim$ $0.01 per instance).

### B.3 DAG Feature Space Analysis

![Refer to caption](https://arxiv.org/html/2602.16873v1/x10.png)

Figure 12: PCA projection of DAG feature space (width ω \\omega, depth, density, coupling ratio) colored by KMeans clusters ( k = 4 k{=}4 ). The four clusters correspond to dominant topology patterns: Chain (sequential), Wide-Shallow (parallel), Deep-Narrow (hierarchical), and Diamond (fan-out/fan-in). Cluster centroids are marked with × \\times.

### B.4 Baseline Reproduction Specification

To ensure fair comparison and full reproducibility, we detail the exact configuration of each baseline method. All baselines use the same 5-model pool as AdaptOrch: GPT-4o-mini, Claude 3.5 Haiku, Gemini 2.0 Flash, Llama 3.3 70B (via Together AI), and Qwen 2.5 72B (via Together AI). Temperature is $0.0$ (greedy) and max\_tokens $=4096$ for all methods unless noted.

MoA-3L [^18]. We implement the 3-layer Mixture-of-Agents architecture as described in the original paper. Layer 1: all 5 models generate independent responses to the full prompt. Layer 2: each of 3 aggregator models (GPT-4o-mini, Claude 3.5 Haiku, Gemini 2.0 Flash) receives all 5 Layer-1 outputs concatenated in the prompt and produces a refined answer. Layer 3: a single synthesizer (GPT-4o-mini) receives all 3 Layer-2 outputs and produces the final answer. Total LLM calls per instance: $5+3+1=9$. Aggregation prompt follows the template in Wang et al. (2024), §A.1.

LLM-Blender [^8]. We use the prompt-based variant (no fine-tuned PairRanker) for fair comparison, since training a ranker on our specific benchmarks would introduce confounding. Stage 1 (Generation): all 5 models produce independent candidates. Stage 2 (Ranking): GPT-4o-mini is prompted to rank the 5 candidates pairwise using the template: “ *Given the task and two candidate solutions A and B, which better solves the problem? Output only ‘A’ or ‘B’.*” This produces $\binom{5}{2}=10$ pairwise comparisons per instance. Stage 3 (Fusion): the top-ranked candidate is returned as the final output (no generative fusion, which would require a trained model). Total LLM calls per instance: $5+10+0=15$.

Static-Parallel / Static-Sequential. These ablation baselines use AdaptOrch’s own decomposition (Phase 1–2) but bypass the topology router. Static-Parallel executes all subtasks simultaneously across 3 models (round-robin assignment); Static-Sequential chains them in dependency order using a single model (GPT-4o-mini). Both use the same synthesis protocol (Phase 5) as AdaptOrch.

### B.5 Per-Cluster Orchestration Gain

Table 5 disaggregates AdaptOrch’s accuracy improvement by DAG cluster (cf. Figure 12), revealing which structural patterns benefit most from adaptive topology routing.

Table 5: Per-cluster accuracy gain ($\Delta$) of AdaptOrch over Single Best, averaged across all three benchmarks. $n$: number of instances assigned to each cluster.

| DAG Cluster | Dominant $\tau$ | $n$ | Single Best | $\Delta$ AdaptOrch |
| --- | --- | --- | --- | --- |
| Chain (sequential) | $\tau_{S}$ | 187 | 54.2% | +3.8 pp |
| Wide-Shallow (parallel) | $\tau_{P}$ | 294 | 49.1% | +12.6 pp |
| Deep-Narrow (hierarchical) | $\tau_{H}$ | 112 | 47.8% | +9.2 pp |
| Diamond (fan-out/fan-in) | $\tau_{X}$ | 105 | 51.3% | +11.4 pp |

The largest gains appear in Wide-Shallow tasks ($+12.6$ pp), where parallelism directly reduces error propagation by distributing independent subtasks. Chain-type tasks show the smallest gain ($+3.8$ pp), consistent with the expectation that fully sequential dependencies leave minimal room for topology improvement.

Router Accuracy (Confusion Matrix). To assess the topology router’s decision quality, we compare its selections against an oracle that exhaustively evaluates all four topologies per instance and selects the highest-scoring one. Across the full test set ($n=698$):

Table 6: Router confusion matrix: predicted topology vs. oracle-optimal topology. Values are instance counts. Overall router accuracy: 81.2% (567/698).

| <svg height="17.19" overflow="visible" version="1.1" width="90.34"><g transform="translate(0,17.19) scale(1,-1)"><path d="M 0,17.19 90.34,0" stroke="#000000" stroke-width="0.4" style="--ltx-stroke-color:#000000;"></path><g transform="translate(0,0)"><g transform="translate(0,8.54) scale(1, -1)"><foreignObject height="8.54" overflow="visible" width="45.17"><span id="A2.T6.1.1.1.pic1.1.1"><span id="A2.T6.1.1.1.pic1.1.1.1"><span id="A2.T6.1.1.1.pic1.1.1.1.1"><span id="A2.T6.1.1.1.pic1.1.1.1.1.1" style="font-size:90%;">Router</span></span> </span></span></foreignObject></g></g><g transform="translate(48.62,8.54)"><g transform="translate(0,8.65) scale(1, -1)"><foreignObject height="8.65" overflow="visible" width="41.72"><span id="A2.T6.1.1.1.pic1.2.1"><span id="A2.T6.1.1.1.pic1.2.1.1"><span id="A2.T6.1.1.1.pic1.2.1.1.1"><span id="A2.T6.1.1.1.pic1.2.1.1.1.1" style="font-size:90%;">Oracle</span></span></span></span></foreignObject></g></g></g></svg> | $\tau_{P}$ | $\tau_{S}$ | $\tau_{H}$ | $\tau_{X}$ |
| --- | --- | --- | --- | --- |
| $\tau_{P}$ | 248 | 12 | 8 | 18 |
| $\tau_{S}$ | 6 | 152 | 9 | 4 |
| $\tau_{H}$ | 14 | 7 | 89 | 11 |
| $\tau_{X}$ | 9 | 5 | 7 | 78 |

The router achieves 81.2% agreement with the oracle. Most misclassifications occur between $\tau_{P}$ and $\tau_{X}$ (18 + 9 = 27 instances), which is expected since Diamond tasks contain both parallel and fan-in components. Importantly, even misrouted instances typically receive the second-best topology, limiting accuracy loss to $<$ 2 pp compared to oracle routing.

[^1]: ALMC: adaptive LLM multi-agent collaboration with manager-judge-optimizer roles. OpenReview preprint. Note: OpenReview ID: jXZGgxTjiK Cited by: §2.5.

[^2]: Model context protocol. Note: [https://modelcontextprotocol.io/](https://modelcontextprotocol.io/) Open standard for LLM-tool integration Cited by: §1, §2.2.

[^3]: Claude code agent teams: parallel subagent orchestration. Note: [https://docs.anthropic.com/en/docs/claude-code](https://docs.anthropic.com/en/docs/claude-code) Research preview, February 2026 Cited by: §1, §2.4.

[^4]: S-DAG: subject-based directed acyclic graph decomposition for multi-agent task allocation. In Proceedings of the AAAI Conference on Artificial Intelligence, Note: arXiv preprint arXiv:2511.06727 Cited by: §2.5.

[^5]: Multi-agent LLM orchestration achieves deterministic, high-quality decision support for incident response. arXiv preprint arXiv:2511.15755. Cited by: §2.4.

[^6]: MoMA: mixture-of-model-and-agent routing for generalized multi-agent orchestration. arXiv preprint arXiv:2509.07571. Cited by: §2.5.

[^7]: Open LLM leaderboard v2. Note: [https://huggingface.co/spaces/open-llm-leaderboard/open\_llm\_leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard) Accessed: 2026-02-15 Cited by: §1, §2.1.

[^8]: LLM-Blender: ensembling large language models with pairwise ranking and generative fusion. arXiv preprint arXiv:2306.02561. Cited by: §B.4, §1, §2.3, item 5.

[^9]: SWE-bench: can language models resolve real-world GitHub issues?. arXiv preprint arXiv:2310.06770. Cited by: 1st item.

[^10]: LangGraph: build stateful multi-agent applications. Note: [https://github.com/langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) Cited by: §1, §2.2.

[^11]: DyTopo: dynamic topology optimization for multi-agent systems via semantic matching. arXiv preprint arXiv:2602.06039. Cited by: §2.5.

[^12]: CrewAI: framework for orchestrating role-playing autonomous AI agents. Note: [https://github.com/crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) Cited by: §1, §2.2.

[^13]: OpenCode: open-source ai coding assistant with multi-provider support. Note: [https://github.com/opencode-ai/opencode](https://github.com/opencode-ai/opencode) Cited by: §1, §2.4.

[^14]: GPQA: a graduate-level Google-Proof q&a benchmark. arXiv preprint arXiv:2311.12022. Cited by: 2nd item.

[^15]: Self-MoA: scalable self-collaboration of a single LLM via mixture-of-agents. arXiv preprint arXiv:2502.00674. Cited by: §2.1, §6.2.

[^16]: Superpowers: multi-agent orchestration framework. Note: [https://github.com/superpower-agents/superpowers](https://github.com/superpower-agents/superpowers) Cited by: §2.4.

[^17]: ORCH: deterministic multi-agent orchestration protocol for structured task execution. Frontiers in Artificial Intelligence. Note: Accepted 30 January 2026, Machine Learning and Artificial Intelligence section External Links: [Document](https://dx.doi.org/10.3389/frai.2026.1748735) Cited by: §2.5.

[^18]: Mixture-of-agents enhances large language model capabilities. arXiv preprint arXiv:2406.04692. Cited by: §B.4, §1, §2.3, item 2.

[^19]: MetaGen: self-evolving multi-agent topologies with role and structure co-optimization. arXiv preprint arXiv:2601.19290. Cited by: §2.5.

[^20]: AutoGen: enabling next-gen LLM applications via multi-agent conversation. arXiv preprint arXiv:2308.08155. Cited by: §2.2.

[^21]: HotpotQA: a dataset for diverse, explainable multi-hop question answering. arXiv preprint arXiv:1809.09600. Cited by: 3rd item.

[^22]: Diversity empowers intelligence: integrating expertise of software engineering agents. arXiv preprint arXiv:2408.07060. Cited by: §2.3.

[^23]: Chatbot arena: an open platform for evaluating LLMs by human preference. arXiv preprint arXiv:2403.04132. Cited by: §2.1.