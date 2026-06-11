"use client";

import { Topic, getTopicTitle, getTopicDescription } from "@/lib/curriculum";

interface TopicSelectorProps {
  topics: Topic[];
  languageCode: string;
  onSelect: (topic: Topic) => void;
}

export default function TopicSelector({ topics, languageCode, onSelect }: TopicSelectorProps) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
        Professor Mbona
      </h2>
      <p className="text-center text-gray-500 mb-1 text-lg">
        Voice Teacher / Mwarimu wa M{"\u0169"}gambo
      </p>

      <div className="grid gap-4">
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelect(topic)}
            className="flex items-center gap-4 p-5 bg-white rounded-xl border-2 border-gray-100 
                       hover:border-emerald-300 hover:shadow-md transition-all duration-200
                       text-left group"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">
              {topic.icon}
            </span>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">
                {getTopicTitle(topic, languageCode)}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {getTopicDescription(topic, languageCode)}
              </p>
            </div>
            <svg
              className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 ml-auto transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
