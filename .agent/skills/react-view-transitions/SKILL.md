---
name: react-view-transitions
description: Use this skill to implement and optimize view transitions in React applications using the View Transitions API.
---

# React View Transitions

This skill covers the integration of the View Transitions API within React apps.

## Implementation Guide
- Use `document.startViewTransition` to wrap state updates that cause DOM changes.
- Ensure unique `view-transition-name` CSS properties for elements that morph between states.
- Handle fallback for browsers that do not support the View Transitions API.
