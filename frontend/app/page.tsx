"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface VocabItem {
  word: string;
  part_of_speech: string;
  meaning_chinese: string;
  usage_explanation: string;
  common_collocation: string;
  example_sentence: string;
}

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [article, setArticle] = useState("");
  const [vocabulary, setVocabulary] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("openai_api_key");
    if (saved) setApiKey(saved);
  }, []);

  function saveApiKey(key: string) {
    setApiKey(key);
    localStorage.setItem("openai_api_key", key);
  }

  async function handleAnalyze() {
    if (!apiKey.trim()) {
      setError("請先輸入 OpenAI API Key");
      return;
    }
    if (!article.trim()) {
      setError("請貼上德文文章");
      return;
    }
    setError("");
    setLoading(true);
    setVocabulary([]);

    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article, apiKey }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "分析失敗");
      }

      const data = await res.json();
      const parsed = JSON.parse(data.result);
      setVocabulary(parsed.vocabulary);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "發生錯誤，請再試一次");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🇩🇪 德文單字提取器</h1>
          <p className="text-sm text-gray-500 mt-1">貼上德文新聞文章，AI 幫你提取 B2 單字</p>
        </div>

        {/* API Key */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            OpenAI API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => saveApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-xs text-gray-400 mt-1">儲存在你的瀏覽器，不會傳給第三方</p>
        </div>

        {/* Article input */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            德文文章
          </label>
          <textarea
            value={article}
            onChange={(e) => setArticle(e.target.value)}
            placeholder="在此貼上德文新聞文章..."
            rows={8}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-xl transition-colors"
        >
          {loading ? "分析中..." : "分析單字"}
        </button>

        {/* Results */}
        {vocabulary.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-700">分析結果</h2>
            {vocabulary.map((v, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-blue-700">{v.word}</span>
                  <span className="text-xs text-gray-400">{v.part_of_speech}</span>
                </div>
                <p className="text-sm text-gray-700">中文：{v.meaning_chinese}</p>
                <p className="text-sm text-gray-600">用法：{v.usage_explanation}</p>
                <p className="text-sm text-gray-600">搭配：{v.common_collocation}</p>
                <p className="text-sm text-gray-500 italic">例句：{v.example_sentence}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
