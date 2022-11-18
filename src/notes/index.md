---
layout: page
order: 1
title: First Notes Page
parent: Course Notes
eleventyComputed:
  eleventyNavigation:
    key: "{{ title }}"
    parent: "{{ parent }}"
    order: "{{ order }}"
---

Well, here's a note

{% image "./src/img/bennie.jpg", "a good boy" %}
