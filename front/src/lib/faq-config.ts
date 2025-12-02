export type FAQCategory = {
  id: string;
  name: string;
  order: number;
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  categoryId: string;
};

export type FAQConfig = {
  categories: FAQCategory[];
  questions: FAQItem[];
};

export const faqConfig: FAQConfig = {
  categories: [
    { id: "general", name: "General", order: 1 },
    { id: "account", name: "Account", order: 2 },
    { id: "billing", name: "Billing", order: 3 },
    { id: "technical", name: "Technical", order: 4 },
  ],
  questions: [
    {
      id: "1",
      question: "What is LearnSup?",
      answer: "LearnSup is a platform that connects students and mentors for learning and teaching opportunities.",
      categoryId: "general",
    },
    {
      id: "2",
      question: "How do I create an account?",
      answer: "You can create an account by clicking on the 'Sign Up' button and following the registration process.",
      categoryId: "account",
    },
    {
      id: "3",
      question: "How do I reset my password?",
      answer: "You can reset your password by clicking on 'Forgot Password' on the login page and following the instructions sent to your email.",
      categoryId: "account",
    },
    {
      id: "4",
      question: "What payment methods are accepted?",
      answer: "We accept major credit cards and PayPal for all transactions.",
      categoryId: "billing",
    },
    {
      id: "5",
      question: "How do I contact support?",
      answer: "You can contact our support team through the 'Contact Support' button at the bottom of this page.",
      categoryId: "general",
    },
  ],
};

