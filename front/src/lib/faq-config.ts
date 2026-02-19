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
    { id: "general", name: "Général", order: 1 },
    { id: "account", name: "Compte", order: 2 },
    { id: "payment", name: "Paiement", order: 3 },
    { id: "gossip", name: "Boîte à ragots", order: 4 },
    { id: "courses", name: "Cours en ligne", order: 5 },
    { id: "courses_presential", name: "Cours en présentiel", order: 6 },
  ],
  questions: [
    {
      id: "1",
      question: "Qu'est-ce que LearnSup ?",
      answer:
        "LearnSup est une plateforme qui connecte les étudiants et les mentors pour des opportunités d'apprentissage et d'enseignement.",
      categoryId: "general",
    },
    {
      id: "2",
      question: "Comment fonctionne LearnSup ?",
      answer:
        "LearnSup permet aux utilisateurs de créer un compte, de rechercher des mentors, et de communiquer via notre système de messagerie intégré.",
      categoryId: "general",
    },
    {
      id: "3",
      question: "Comment contacter le support ?",
      answer:
        "Vous pouvez contacter notre équipe de support via le bouton 'Contact' en bas de cette page.",
      categoryId: "general",
    },

    // Compte
    {
      id: "10",
      question: "Comment créer un compte ?",
      answer:
        "Vous pouvez créer un compte en cliquant sur le bouton 'S'inscrire' et en suivant le processus d'inscription.",
      categoryId: "account",
    },
    {
      id: "11",
      question: "Comment réinitialiser mon mot de passe ?",
      answer:
        "Vous pouvez réinitialiser votre mot de passe en cliquant sur 'Mot de passe oublié' sur la page de connexion et en suivant les instructions envoyées à votre email.",
      categoryId: "account",
    },
    {
      id: "12",
      question: "Comment modifier mes informations personnelles ?",
      answer:
        "Accédez à votre profil en cliquant sur votre avatar en haut à droite, puis sélectionnez 'Paramètres' pour modifier vos informations.",
      categoryId: "account",
    },
    {
      id: "13",
      question: "Comment supprimer mon compte ?",
      answer:
        "Pour supprimer votre compte, rendez-vous dans les paramètres de votre compte et sélectionnez l'option 'Supprimer mon compte'. Cette action est irréversible.",
      categoryId: "account",
    },

    // Paiement
    {
      id: "20",
      question: "Quels sont les moyens de paiement acceptés ?",
      answer:
        "Nous acceptons les principales cartes de crédit et PayPal pour toutes les transactions.",
      categoryId: "payment",
    },
    {
      id: "21",
      question: "Comment acheter des crédits ?",
      answer:
        "Cliquez sur le bouton 'Acheter des crédits' dans l'en-tête et sélectionnez le package qui vous convient.",
      categoryId: "payment",
    },
    {
      id: "22",
      question: "Qu'est-ce que la version Premium ?",
      answer:
        "La version Premium offre des fonctionnalités supplémentaires comme des cours exclusifs, un support prioritaire, et l'accès à des mentors premium.",
      categoryId: "payment",
    },
    {
      id: "23",
      question: "Puis-je obtenir un remboursement ?",
      answer:
        "Les remboursements sont possibles dans les 14 jours suivant l'achat si vous n'êtes pas satisfait. Contactez le support pour en faire la demande.",
      categoryId: "payment",
    },

    // Boîte à ragots
    {
      id: "50",
      question: "Qu'est-ce que la boîte à ragots ?",
      answer:
        "La boîte à ragots est un espace communautaire où vous pouvez partager des anecdotes, des histoires et discuter de sujets variés de manière informelle.",
      categoryId: "gossip",
    },
    {
      id: "51",
      question: "Y a-t-il des règles de modération ?",
      answer:
        "Oui, tout contenu offensant, discriminatoire ou inapproprié sera supprimé et peut entraîner une suspension de compte.",
      categoryId: "gossip",
    },
    {
      id: "52",
      question: "Puis-je signaler un contenu inapproprié ?",
      answer:
        "Oui, chaque publication dispose d'un bouton de signalement. Notre équipe de modération examinera les signalements dans les plus brefs délais.",
      categoryId: "gossip",
    },

    // Cours en ligne
    {
      id: "70",
      question: "Comment accéder aux cours en ligne ?",
      answer:
        "Les cours en ligne sont disponibles dans la section 'Cours en ligne'. Certains sont gratuits, d'autres nécessitent des crédits ou un abonnement Premium.",
      categoryId: "courses",
    },
    {
      id: "71",
      question: "Puis-je obtenir un certificat à la fin d'un cours ?",
      answer:
        "Oui, les cours payants offrent généralement un certificat de completion que vous pouvez télécharger après avoir terminé toutes les leçons.",
      categoryId: "courses",
    },
    {
      id: "73",
      question: "Comment devenir créateur de cours ?",
      answer:
        "Si vous êtes un mentor, vous pouvez postuler pour devenir créateur de cours via la section 'Devenir mentor' dans votre profil.",
      categoryId: "courses",
    },
  ],
};
