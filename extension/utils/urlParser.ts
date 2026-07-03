/**
 * URL Parser for Codeforces submit targets.
 * This is an exact port of cph-submit's resolveSubmitTarget logic.
 */

type SubmitRule = {
  re: RegExp;
  to: (match: RegExpMatchArray, origin: string) => string;
  submitByIndex: boolean;
};

const SUBMIT_RULES: SubmitRule[] = [
  {
    re: /^\/contest\/(\d+)(?:\/problem\/(?<problemIndex>[^\/]+))?\/?$/,
    to: (m, o) => `${o}/contest/${m[1]}/submit`,
    submitByIndex: true,
  },
  {
    re: /^\/gym\/(\d+)(?:\/problem\/(?<problemIndex>[^\/]+))?\/?$/,
    to: (m, o) => `${o}/gym/${m[1]}/submit`,
    submitByIndex: true,
  },
  {
    re: /^\/problemset\/gymProblem\/(\d+)\/(?<problemIndex>[^\/]+)\/?$/,
    to: (m, o) => `${o}/gym/${m[1]}/submit`,
    submitByIndex: true,
  },
  {
    re: /^\/group\/([^\/]+)\/contest\/(\d+)(?:\/problem\/(?<problemIndex>[^\/]+))?\/?$/,
    to: (m, o) => `${o}/group/${m[1]}/contest/${m[2]}/submit`,
    submitByIndex: true,
  },
  {
    re: /^\/edu\/course\/([^\/]+)\/lesson\/([^\/]+)\/([^\/]+)\/practice\/contest\/(\d+)\/problem\/(?<problemIndex>[^\/]+)\/?$/,
    to: (m, o) =>
      `${o}/edu/course/${m[1]}/lesson/${m[2]}/${m[3]}/practice/contest/${m[4]}/submit`,
    submitByIndex: true,
  },
  {
    re: /^\/problemset\/problem\/(\d+)\/(?<problemIndex>[^\/]+)\/?$/,
    to: (m, o) => `${o}/problemset/submit/${m[1]}/${m[2]}`,
    submitByIndex: false,
  },
  {
    re: /^\/problemsets\/acmsguru\/problem\/(\d+)\/(?<problemIndex>[^\/]+)\/?$/,
    to: (m, o) => `${o}/problemsets/acmsguru/submit/${m[1]}/${m[2]}`,
    submitByIndex: false,
  },
];

const DEFAULT_SUBMIT_TARGET = {
  submitUrl: "https://codeforces.com/problemset/submit",
  submitByIndex: false,
  problemIndex: null as string | null,
};

export function resolveCodeforcesSubmitTarget(problemUrl: string): {
  submitUrl: string;
  submitByIndex: boolean;
  problemIndex: string | null;
} {
  try {
    const url = new URL(problemUrl);
    const path = url.pathname;
    const origin = `${url.protocol}//${url.host}`;

    for (const rule of SUBMIT_RULES) {
      const match = path.match(rule.re);
      if (match) {
        return {
          submitUrl: rule.to(match, origin),
          submitByIndex: rule.submitByIndex,
          problemIndex: match.groups?.problemIndex || null,
        };
      }
    }

    return DEFAULT_SUBMIT_TARGET;
  } catch {
    return DEFAULT_SUBMIT_TARGET;
  }
}
