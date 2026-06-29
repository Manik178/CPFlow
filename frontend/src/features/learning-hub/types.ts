export interface LearningHubData {
  overview: {
    summary: string;
    concepts: string[];
    tags: string[];
    difficulty: string;
    expected_time_complexity: string;
    expected_space_complexity: string;
    key_insight: string;
  };
  editorial: {
    markdown_content: string;
  };
  alternatives: {
    approaches: {
      name: string;
      algorithm: string;
      time_complexity: string;
      space_complexity: string;
      advantages: string;
      disadvantages: string;
      when_to_use: string;
    }[];
  };
  similarProblems: {
    problems: {
      name: string;
      url: string;
      platform: string;
      relation: string;
      reasoning: string;
    }[];
  };
  resources: {
    resources: {
      title: string;
      url: string;
      type: string;
    }[];
  };
}
