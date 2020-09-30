# Vidijo 1.0.0

Vidijo is an open source web application for presenting a curated selection of Open Access journals.

## Prerequisites

You must have _Docker_ and _docker-compose_ installed on your system in order to run Vidijo.

## Installation

Create a file called `environment.prod.ts` in `frontend/app/config` with the following content.
Replace the annotated values with your own configuration.

```typescript
// environment.prod.ts
export const environment = {
  production: true,

  vidijoApiUrl: "/api/v1",
  institutionName: "NTNM Library", // Replace with the name of your institution
  privacyPolicyUrl: "/static/privacy-policy/privacy-policy.html",
}
```

You can also replace the `icon.png` file with your own icon.
Make sure that you also call it `icon.png` and choose an image with square resolution (e.g. 96 x 96 pixels).
