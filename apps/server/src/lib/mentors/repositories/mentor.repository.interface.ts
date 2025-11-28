export interface MentorEntity {
  id: string;
  userId: string;
  role: string | null;
  bio: string | null;
  domain: string | null;
  photoUrl: string | null;
  qualifications: string | null;
  experience: string | null;
  socialMediaLinks: any;
  areasOfExpertise: any;
  mentorshipTopics: any;
  calendlyLink: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export interface MentorFeedbackEntity {
  id: string;
  mentorId: string;
  apprenticeId: string;
  workshopId: string | null;
  rating: number;
  comment: string | null;
  isAnonymous: boolean;
  createdAt: Date;
  apprentice?: {
    user?: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
  workshop?: {
    id: string;
    title: string;
    date: Date | null;
  };
}

export interface MentorWorkshopEntity {
  id: string;
  title: string;
  description: string | null;
  date: Date | null;
  time: string | null;
  duration: number | null;
  location: string | null;
  isVirtual: boolean;
  maxParticipants: number | null;
  publishedAt: Date | null;
  feedbacks?: Array<{ rating: number }>;
}

export interface IMentorRepository {
  findPublishedMentorById(id: string): Promise<MentorEntity | null>;
  findMentorById(id: string): Promise<MentorEntity | null>;
  findApprenticeByUserId(userId: string): Promise<MentorEntity | null>;
  findMentorFeedbacks(
    mentorId: string,
    filters?: { workshopId?: string }
  ): Promise<MentorFeedbackEntity[]>;
  findMentorPublicWorkshops(mentorId: string): Promise<MentorWorkshopEntity[]>;
}

