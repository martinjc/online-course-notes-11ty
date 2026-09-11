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

{% image "./src/img/bennie.jpg", "a good boy", "Bennie — a very good boy" %}

| Feature / Dimension | Exploratory Data Visualisation | Explanatory Data Visualisation |
| :--- | :--- | :--- |
| **Core Purpose** | Uncover hidden patterns, anomalies, trends, and hypotheses | Deliver a clear, targeted story, recommendation, or takeaway |
| **Primary Audience** | Analysts, data scientists, domain experts, researchers | Decision-makers, executives, clients, general audience |
| **Data State** | Raw, granular, complex, multidimensional, unfiltered | Aggregated, curated, filtered, focused |
| **Visual Design** | Functional, rapid, low-polish, system defaults | Polished, intentional, high signal-to-noise ratio, custom styled |
| **Interactivity Level** | High (slicing, zooming, filtering, drill-downs) | Low to Moderate (guided narrative, static presentation) |
| **Key Question Asked** | *"What story is hidden inside this dataset?"* | *"What conclusion or action should the audience take?"* |
| **Focus on Detail** | High depth; displays variance, outliers, and noise | High focus; highlights specific data points and mutes noise |
| **Primary Workflow** | Fast, flexible, hypothesis-driven iteration | Strategic, audience-centric visual storytelling |
| **Common Tools** | Python (Seaborn/Matplotlib), R (ggplot2), Jupyter, SQL drafts | PowerPoint, Figma, Datawrapper, Tableau Dashboards, D3.js |

{% panel "info", "Information" %}
This is an informational panel highlighting helpful context and tips for learners.
{% endpanel %}

{% panel "warning", "Warning" %}
Be cautious when interpreting raw data without normalising for confounding factors.
{% endpanel %}

{% panel "prompt", "Discussion Prompt" %}
What other visual encodings could be used to effectively represent both positive and negative values?
{% endpanel %}

{% panel "question", "Check Your Understanding" %}
Why is explanatory visualisation usually less interactive than exploratory visualisation?
{% endpanel %}

{% panel "aside", "Historical Note" %}
The 'Climate Stripes' visualisation was originally designed by Professor Ed Hawkins in 2018.
{% endpanel %}

