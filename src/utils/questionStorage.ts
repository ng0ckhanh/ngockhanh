import { Question, TopicId } from '../types';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions';

const STORAGE_KEY = 'contra_knowledge_questions_v1';

export function getStoredQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_QUESTIONS));
      return DEFAULT_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_QUESTIONS;
  } catch (err) {
    console.warn('Failed to load questions from localStorage', err);
    return DEFAULT_QUESTIONS;
  }
}

export function saveStoredQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed to save questions to localStorage', err);
  }
}

export function addQuestion(questionData: Omit<Question, 'id'>): Question {
  const current = getStoredQuestions();
  const newQuestion: Question = {
    ...questionData,
    id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
  };
  const updated = [newQuestion, ...current];
  saveStoredQuestions(updated);
  return newQuestion;
}

export function updateQuestion(id: string, updatedData: Partial<Question>): Question[] {
  const current = getStoredQuestions();
  const updated = current.map(q => {
    if (q.id === id) {
      return { ...q, ...updatedData };
    }
    return q;
  });
  saveStoredQuestions(updated);
  return updated;
}

export function deleteQuestion(id: string): Question[] {
  const current = getStoredQuestions();
  const updated = current.filter(q => q.id !== id);
  saveStoredQuestions(updated);
  return updated;
}

export function resetQuestionsToDefault(): Question[] {
  saveStoredQuestions(DEFAULT_QUESTIONS);
  return DEFAULT_QUESTIONS;
}

export function getQuestionsByTopic(topicId: TopicId): Question[] {
  const all = getStoredQuestions();
  if (topicId === 'all') return all;
  return all.filter(q => q.topic === topicId);
}
