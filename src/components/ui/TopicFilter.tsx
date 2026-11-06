import "./TopicFilter.css";

export interface TopicFilterProps {
  options: string[];
  value: string[];
  onValueChange: (value: string[]) => void;
  label?: string;
  resultCount?: number;
  countNoun: "posts" | "projects";
}

const countForms = {
  posts: { one: "публикация", few: "публикации", many: "публикаций" },
  projects: { one: "проект", few: "проекта", many: "проектов" },
};
const pluralRules = new Intl.PluralRules("ru");

/** Controlled OR selection. Empty selection includes every topic. */
export function TopicFilter({
  options,
  value,
  onValueChange,
  label = "Фильтр по темам",
  resultCount,
  countNoun,
}: TopicFilterProps) {
  const forms = countForms[countNoun];
  const countWord =
    resultCount === undefined
      ? ""
      : forms[pluralRules.select(resultCount) as keyof typeof forms] ?? forms.many;
  const topics = [...new Set(options)];
  const toggle = (topic: string) =>
    onValueChange(
      value.includes(topic)
        ? value.filter((item) => item !== topic)
        : [...value, topic],
    );

  return (
    <div className="ps-topic-filter">
      <div className="ps-topic-filter-options" role="group" aria-label={label}>
        <button
          type="button"
          className="ps-topic-filter-option"
          aria-pressed={!value.length}
          onClick={() => onValueChange([])}
        >
          Все
        </button>
        {topics.map((topic) => (
          <button
            key={topic}
            type="button"
            className="ps-topic-filter-option"
            aria-pressed={value.includes(topic)}
            onClick={() => toggle(topic)}
          >
            {topic}
          </button>
        ))}
      </div>
      {resultCount !== undefined && (
        <p
          className="ps-topic-filter-status ps-caption"
          role="status"
          aria-atomic="true"
        >
          {resultCount} {countWord}
        </p>
      )}
    </div>
  );
}
