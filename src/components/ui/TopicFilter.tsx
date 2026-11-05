import "./TopicFilter.css";

export interface TopicFilterProps {
  options: string[];
  value: string[];
  onValueChange: (value: string[]) => void;
  label?: string;
  resultCount?: number;
  totalCount?: number;
}

/** Controlled OR selection. Empty selection includes every topic. */
export function TopicFilter({
  options,
  value,
  onValueChange,
  label = "Фильтр по темам",
  resultCount,
  totalCount,
}: TopicFilterProps) {
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
        <p className="ps-topic-filter-status" role="status" aria-atomic="true">
          Найдено: {resultCount}
          {totalCount !== undefined ? ` из ${totalCount}` : ""}
        </p>
      )}
    </div>
  );
}
