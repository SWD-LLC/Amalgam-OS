import type {
  CategoryEntry,
  Clip,
  ContentExperiment,
  DistributionItem,
  EngagementLog,
  GrowthEntry,
  LongVideo,
  RaidPartner,
  RetentionCheckpoint,
  Script,
  ShortBlueprint,
  StreamProject,
  TimelineSection,
} from '../types';

type EntityMap = {
  streamProjects: StreamProject[];
  clips: Clip[];
  raidPartners: RaidPartner[];
  scripts: Script[];
  growthEntries: GrowthEntry[];
  categoryEntries: CategoryEntry[];
  contentExperiments: ContentExperiment[];
  distributionItems: DistributionItem[];
  longVideos: LongVideo[];
  shortBlueprints: ShortBlueprint[];
  timelineSections: TimelineSection[];
  retentionCheckpoints: RetentionCheckpoint[];
  engagementLogs: EngagementLog[];
};

const seeds: EntityMap = {
  streamProjects: [
    { id: 'sp-1', title: 'Social Norm Violation Interview Stream', status: 'recording', platformTargets: ['Twitch', 'YouTube'], updatedAt: new Date().toISOString() },
    { id: 'sp-2', title: 'Belief Challenge Street Session', status: 'editing', platformTargets: ['Kick', 'TikTok'], updatedAt: new Date().toISOString() },
  ],
  clips: [
    { id: 'c-1', title: 'Best social tension reveal', platform: 'TikTok', posted: true, postedAt: new Date().toISOString(), views: 12344 },
    { id: 'c-2', title: 'Curiosity loop opener', platform: 'YT Shorts', posted: false, views: 0 },
  ],
  raidPartners: [
    { id: 'r-1', channelName: 'NovaFPS', avgCCV: 77, niche: 'Competitive FPS', lastRaidDate: '2026-04-22', status: 'active' },
    { id: 'r-2', channelName: 'CozyQuest', avgCCV: 42, niche: 'Story + Chill', lastRaidDate: '2026-04-16', status: 'new' },
  ],
  scripts: [],
  growthEntries: [
    { id: 'g-1', lever: 'Category Arbitrage', weeklyTarget: 5, thisWeek: 3, status: 'on-track', notes: 'Pull ratio data daily' },
    { id: 'g-2', lever: 'Clip Pipeline', weeklyTarget: 12, thisWeek: 10, status: 'on-track', notes: 'Prioritize Shorts' },
    { id: 'g-3', lever: 'Raid Network', weeklyTarget: 4, thisWeek: 2, status: 'behind', notes: 'Book two weekend raids' },
    { id: 'g-4', lever: 'Stream Schedule', weeklyTarget: 6, thisWeek: 6, status: 'ahead', notes: 'Maintain consistency' },
    { id: 'g-5', lever: 'VOD Funnel', weeklyTarget: 3, thisWeek: 1, status: 'behind', notes: 'Clip chapter highlights' },
    { id: 'g-6', lever: 'Collabs', weeklyTarget: 2, thisWeek: 1, status: 'on-track', notes: 'Follow up with creators' },
  ],
  categoryEntries: [],
  contentExperiments: [
    {
      id: 'exp-1',
      pillar: 'Social Norm Violation',
      socialNormViolation: true,
      beliefChallenge: 'Ask strangers what social rule they secretly ignore.',
      humanVulnerability: 'Admit one personal contradiction first.',
      escalationExperiment: 'Follow each answer with a harder why question.',
    },
  ],
  distributionItems: [
    { id: 'd-1', enabled: true, status: 'planned', type: 'short', platform: 'YT Shorts', hookCategory: 'Social Tension' },
    { id: 'd-2', enabled: false, status: 'filmed', type: 'long', platform: 'YouTube', hookCategory: 'Curiosity' },
    { id: 'd-3', enabled: true, status: 'editing', type: 'short', platform: 'Instagram Reels', hookCategory: 'Outcome' },
    { id: 'd-4', enabled: true, status: 'scheduled', type: 'short', platform: 'TikTok', hookCategory: 'Other' },
  ],
  longVideos: [
    { id: 'VID-114', pillar: 'Human Vulnerability', coreQuestion: 'What truth are you avoiding?', location: 'Seattle Waterfront', stakes: 'Must get 10 candid answers', status: 'editing' },
  ],
  shortBlueprints: [
    {
      id: 'SHORT-9',
      videoId: 'VID-114',
      hookText: 'Most people fake this daily. Do you?',
      category: 'Social Tension',
      posted: false,
      link: '',
      motionBeat: 'Fast zoom to strongest reaction',
      hookBeat: 'Question on screen by second 2',
      interactionBeat: 'Hard follow-up from creator',
      cliffhangerBeat: 'Answer cut before final reveal',
      captions: 'Large white + yellow emphasis words',
      funnelLine: 'Full conversation in today\'s long video',
      pinned: 'Would you answer this on camera?',
      longVideoId: 'VID-114',
    },
  ],
  timelineSections: [
    { id: 't-1', timeStart: '0:00', timeEnd: '0:20', section: 'Cold Open', whatHappens: 'Best moment / strongest reaction', retentionWhy: 'Hook attention immediately', notes: 'No context, no explanation' },
    { id: 't-2', timeStart: '0:20', timeEnd: '1:00', section: 'Premise', whatHappens: 'What you are testing / asking', retentionWhy: 'Orient viewer fast', notes: 'One sentence only' },
    { id: 't-3', timeStart: '1:00', timeEnd: '4:00', section: 'Setup', whatHappens: 'Rules, location, stakes', retentionWhy: 'Prevent early drop-off', notes: 'Cut any rambling' },
    { id: 't-4', timeStart: '4:00', timeEnd: '9:00', section: 'Early interactions', whatHappens: 'First conversations establish pattern', retentionWhy: 'Audience learns loop', notes: 'Jump cut aggressively' },
    { id: 't-5', timeStart: '9:00', timeEnd: '14:00', section: 'Midpoint Shift', whatHappens: 'Pushback or emotional answer', retentionWhy: 'Reset attention', notes: 'Call out: this changed things' },
    { id: 't-6', timeStart: '14:00', timeEnd: '18:00', section: 'Escalation', whatHappens: 'Stronger questions, faster pace', retentionWhy: 'Sustain watch time', notes: 'Less talking, more people' },
    { id: 't-7', timeStart: '18:00', timeEnd: '20:30', section: 'Resolution', whatHappens: 'Best conversation payoff', retentionWhy: 'Deliver payoff', notes: 'Let moment breathe' },
    { id: 't-8', timeStart: '20:30', timeEnd: '22:00', section: 'Reflection', whatHappens: 'What surprised you', retentionWhy: 'Meaning without preaching', notes: 'Keep open-ended' },
  ],
  retentionCheckpoints: [
    { id: 'r-0', timeSec: 0, retentionPct: 100, dropPct: 8, section: 'Cold Open', likelyProblem: '', fixApplied: '' },
    { id: 'r-30', timeSec: 30, retentionPct: 92, dropPct: 7, section: 'Setup', likelyProblem: '', fixApplied: '' },
    { id: 'r-60', timeSec: 60, retentionPct: 85, dropPct: 8, section: 'Setup', likelyProblem: 'Talking too long', fixApplied: 'Cut 30 seconds' },
    { id: 'r-120', timeSec: 120, retentionPct: 77, dropPct: 7, section: 'Early interactions', likelyProblem: 'Slow first interaction', fixApplied: 'Jump into first challenge faster' },
    { id: 'r-180', timeSec: 180, retentionPct: 70, dropPct: 7, section: 'Early interactions', likelyProblem: 'Questions too soft', fixApplied: 'Ask harder question' },
  ],
  engagementLogs: [
    {
      id: 'e-1',
      date: '2026-04-28',
      type: 'Short',
      platform: 'TikTok',
      posted: true,
      videoId: 'VID-114',
      questionAsked: 'What social rule do you break most often?',
      pinned: 'Would you answer this on camera?',
      replies: 64,
    },
  ],
};

const key = 'amalgam-base44';

const cloneSeeds = () => JSON.parse(JSON.stringify(seeds)) as EntityMap;

function isEntityMap(value: unknown): value is EntityMap {
  if (!value || typeof value !== 'object') return false;
  return Object.keys(seeds).every((entity) => Array.isArray((value as Record<string, unknown>)[entity]));
}

function getStore(): EntityMap {
  const raw = localStorage.getItem(key);
  if (!raw) {
    const fresh = cloneSeeds();
    localStorage.setItem(key, JSON.stringify(fresh));
    return fresh;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isEntityMap(parsed)) return parsed;
  } catch {
    // no-op: fallback to fresh seed if malformed JSON
  }

  const fallback = cloneSeeds();
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function setStore(next: EntityMap) {
  localStorage.setItem(key, JSON.stringify(next));
}

export const Base44 = {
  list<K extends keyof EntityMap>(entity: K): EntityMap[K] {
    return getStore()[entity];
  },
  upsert<K extends keyof EntityMap>(entity: K, record: EntityMap[K][number]) {
    const data = getStore();
    const current = data[entity] as Array<{ id: string }>;
    const index = current.findIndex((item) => item.id === (record as { id: string }).id);
    if (index === -1) current.push(record as { id: string });
    else current[index] = record as { id: string };
    setStore(data);
  },
  insert<K extends keyof EntityMap>(entity: K, record: EntityMap[K][number]) {
    const data = getStore();
    (data[entity] as Array<{ id: string }>).unshift(record as { id: string });
    setStore(data);
  },
  reset() {
    const fresh = cloneSeeds();
    setStore(fresh);
    return fresh;
  },
};
