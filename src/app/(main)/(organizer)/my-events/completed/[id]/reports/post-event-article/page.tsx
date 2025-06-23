"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import eventReportService from "@/services/eventReportService";
import { ArticleManualInputsDto } from "@/types/event";
import styles from './article.module.css';

const fieldExplanations: Record<Exclude<keyof ArticleManualInputsDto, 'language'>, string> = {
  organizingBody: "Official name of the organizing body (e.g., club, department, or committee).",
  creditIndividuals: "List of individuals to credit, such as speakers, facilitators, or key contributors (comma-separated).",
  eventObjectives: "Describe the main objectives or goals of the event.",
  activitiesConducted: "Summarize the main activities, sessions, or highlights conducted during the event.",
  targetAudience: "Describe the target audience (e.g., students, faculty, public) and any notable participation details.",
  perceivedImpact: "State the perceived impact or outcomes of the event (e.g., skills gained, feedback, achievements).",
  acknowledgements: "Acknowledge supporters, partners, or anyone who contributed to the event's success.",
  appreciationMessage: "Any additional appreciation or thank you messages for volunteers, sponsors, or participants."
};

// Local type override to allow null values for form state
type ArticleManualInputsForm = {
  organizingBody: string | null;
  creditIndividuals: string | null;
  eventObjectives: string | null;
  activitiesConducted: string | null;
  targetAudience: string | null;
  perceivedImpact: string | null;
  acknowledgements: string | null;
  appreciationMessage: string | null;
  language: string; // 'en' or 'ms'
};

const initialForm: ArticleManualInputsForm = {
  organizingBody: null,
  creditIndividuals: null,
  eventObjectives: null,
  activitiesConducted: null,
  targetAudience: null,
  perceivedImpact: null,
  acknowledgements: null,
  appreciationMessage: null,
  language: 'en',
};

export default function GenerateArticlePage() {
  const params = useParams();
  const eventId = params.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : "";

  const [form, setForm] = useState<ArticleManualInputsForm>(initialForm);
  const [article, setArticle] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value === "" && name !== 'language' ? null : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setArticle("");
    try {
      // Cast form to ArticleManualInputsDto for the API call
      const result = await eventReportService.getPostEventArticle(Number(eventId), form as ArticleManualInputsDto);
      setArticle(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate article.");
    } finally {
      setLoading(false);
    }
  };

  // Function to generate and download a Word file
  const handleGenerateWord = () => {
    if (!article) return;
    // Create a Blob with the article content as plain text (simple .doc file)
    const blob = new Blob([
      `<html><head><meta charset='utf-8'></head><body><pre style="font-family:inherit;font-size:16px;">${article.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body></html>`
    ], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'event-article.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Generate Post-Event Article</h1>
      <div className={styles.hint}>
        <strong>Hint:</strong> This is an AI-generated article. <b>All fields are optional.</b> However, the more detailed information you provide, the more accurate and relevant the generated article will be.
      </div>
      <div className={styles.flexRow}>
        {/* Left column: Manual Input Form */}
        <div className={styles.formCol}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Language selection */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="language" className={styles.label}>Language</label>
              <span className={styles.explanation}>Choose the language for the generated article.</span>
              <select
                id="language"
                name="language"
                value={form.language}
                onChange={handleChange}
                className={styles.textarea}
                style={{ minHeight: 40, maxHeight: 44 }}
              >
                <option value="English">English</option>
                <option value="Bahasa Melayu">Bahasa Melayu</option>
              </select>
            </div>
            {Object.entries(fieldExplanations).map(([key, explanation]) => (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor={key} className={styles.label}>
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                </label>
                <span className={styles.explanation}>{explanation}</span>
                <textarea
                  id={key}
                  name={key}
                  value={form[key as keyof ArticleManualInputsForm] ?? ""}
                  onChange={handleChange}
                  rows={key === "activitiesConducted" || key === "eventObjectives" || key === "perceivedImpact" ? 3 : 2}
                  className={styles.textarea}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className={styles.button}
              style={loading ? { cursor: 'not-allowed', opacity: 0.7 } : {}}
            >
              {loading ? "Generating..." : "Generate Article"}
            </button>
            {error && <div className={styles.error}>{error}</div>}
          </form>
        </div>
        {/* Right column: Generated Article */}
        <div className={styles.articleCol}>
          <h2 className={styles.articleTitle}>Generated Article</h2>
          <textarea
            value={article}
            onChange={e => setArticle(e.target.value)}
            rows={Math.max(16, article.split('\n').length + 2)}
            className={styles.textarea}
            placeholder="The generated article will appear here."
          />
          {article && (
            <button
              className={`${styles.button} ${styles.buttonPdf}`}
              onClick={handleGenerateWord}
              type="button"
            >
               Generate Word File
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
