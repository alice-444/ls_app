import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Seeding community data...');

  // Get an admin or mentor user to be the author
  const firstUser = await prisma.user.findFirst();
  if (!firstUser) {
    console.error('No user found to assign as author. Please run the general seed first.');
    return;
  }

  // 1. Student Deals
  const deals = [
    {
      title: 'Burger King - Menu Étudiant',
      description: 'Le menu Whopper ou Steakhouse à 5€ sur présentation de la carte étudiant.',
      category: 'FOOD',
      link: 'https://www.burgerking.fr',
      promoCode: 'STUDENT24',
      status: 'APPROVED',
      proposedById: firstUser.id,
    },
    {
      title: 'Notion Plus - Gratuit pour les étudiants',
      description: 'Obtenez toutes les fonctionnalités premium de Notion gratuitement avec votre email académique.',
      category: 'SOFTWARE',
      link: 'https://www.notion.so/students',
      status: 'APPROVED',
      proposedById: firstUser.id,
    },
    {
      title: 'Spotify Premium Student',
      description: '1 mois gratuit puis 5,99€/mois. Inclut un accès à Hulu et SHOWTIME.',
      category: 'SERVICES',
      link: 'https://www.spotify.com/fr/student/',
      status: 'APPROVED',
      proposedById: firstUser.id,
    },
    {
      title: 'Pass Culture - 300€ offerts',
      description: 'Profitez de 300€ pour vos sorties culturelles, livres et abonnements numériques.',
      category: 'CULTURE',
      link: 'https://pass.culture.fr/',
      status: 'APPROVED',
      proposedById: firstUser.id,
    },
  ];

  for (const deal of deals) {
    await prisma.student_deal.create({ data: deal });
  }

  // 2. Community Spots
  const spots = [
    {
      name: 'Bibliothèque Sainte-Geneviève',
      description: 'Le temple du calme avec des prises à chaque table. Idéal pour les révisions intenses.',
      address: '10 Place du Panthéon, 75005 Paris',
      tags: ['Ultra Calme', 'Prises dispo'],
      rating: 4.8,
      status: 'APPROVED',
      proposedById: firstUser.id,
    },
    {
      name: 'Le Pavillon des Canaux',
      description: 'Un café cosy au bord de l\'eau. On peut bosser dans une baignoire ou un lit !',
      address: '39 Quai de la Loire, 75019 Paris',
      tags: ['Wi-Fi Gratuit', 'Café pas cher'],
      rating: 4.5,
      status: 'APPROVED',
      proposedById: firstUser.id,
    },
    {
      name: 'Anticafé Beaubourg',
      description: 'On paye au temps passé, café et snacks à volonté. Parfait pour les projets de groupe.',
      address: '79 Rue Quincampoix, 75003 Paris',
      tags: ['Prises dispo', 'Wi-Fi Gratuit'],
      rating: 4.6,
      status: 'APPROVED',
      proposedById: firstUser.id,
    },
  ];

  for (const spot of spots) {
    await prisma.community_spot.create({ data: spot });
  }

  // 3. Weekly Poll
  await prisma.community_poll.create({
    data: {
      question: 'Quel est ton moment préféré pour réviser ?',
      options: [
        { id: 'morning', label: 'Tôt le matin (6h-9h)' },
        { id: 'afternoon', label: 'L\'après-midi classique' },
        { id: 'night', label: 'L\'oiseau de nuit (22h-2h)' },
        { id: 'deadline', label: 'En panique 1h avant' },
      ],
      active: true,
      status: 'APPROVED',
      proposedById: firstUser.id,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
