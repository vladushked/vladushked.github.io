import { useId, useState } from "react";
import { formatCount, topicLabel, useLanguage } from "../../i18n";
import "./TopicFilter.css";

export interface TopicFilterProps {
  options: string[];
  value: string[];
  onValueChange: (value: string[]) => void;
  title: string;
  label?: string;
  resultCount?: number;
  countNoun: "posts" | "projects";
}

/** Controlled OR selection. Empty selection includes every topic. */
export function TopicFilter({
  options,
  value,
  onValueChange,
  title,
  label,
  resultCount,
  countNoun,
}: TopicFilterProps) {
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const optionsId = useId();
  const topics = [...new Set(options)];
  const toggle = (topic: string) =>
    onValueChange(
      value.includes(topic)
        ? value.filter((item) => item !== topic)
        : [...value, topic],
    );

  return (
    <div className="ps-topic-filter">
      <div className="ps-archive-heading">
        <h1 className="ps-archive-title">{title}</h1>
        <button
          type="button"
          className="ps-topic-filter-toggle"
          aria-expanded={open}
          aria-controls={optionsId}
          onClick={() => setOpen((current) => !current)}
        >
          {t("filters")}
          {value.length > 0 && <span> ({value.length})</span>}
        </button>
      </div>
      {resultCount !== undefined && (
        <p
          className="ps-topic-filter-status ps-caption"
          role="status"
          aria-atomic="true"
        >
          {formatCount(resultCount, countNoun, language)}
        </p>
      )}
      <div
        id={optionsId}
        className="ps-topic-filter-options"
        role="group"
        aria-label={label ?? t("topicFilter")}
        hidden={!open}
      >
        <button
          type="button"
          className="ps-topic-filter-option"
          aria-pressed={!value.length}
          onClick={() => onValueChange([])}
        >
          {t("all")}
        </button>
        {topics.map((topic) => (
          <button
            key={topic}
            type="button"
            className="ps-topic-filter-option"
            aria-pressed={value.includes(topic)}
            onClick={() => toggle(topic)}
          >
            {topicLabel(topic, language)}
          </button>
        ))}
      </div>
    </div>
  );
}
