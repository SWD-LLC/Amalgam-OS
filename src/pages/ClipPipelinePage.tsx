import {
  DistributionMatrix,
  EngagementTable,
  LongVideoTracker,
  RetentionTable,
  ShortsTables,
  TimelineCards,
} from '../features/clip-pipeline/ClipPipelineTables';
import { useClipPipelineData } from '../features/clip-pipeline/useClipPipelineData';

export function ClipPipelinePage() {
  const { clips, distribution, videos, shorts, timeline, retention, engagement, metrics, markClipPosted, resetSeedData } = useClipPipelineData();

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">Clip Pipeline</h1>
      <p className="text-sm text-slate-300">Distribution workflow + retention diagnostics for Shorts and long-form repurposing.</p>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-xl bg-slate-800 p-3">Posted clips: <strong>{metrics.posted}</strong></div>
        <div className="rounded-xl bg-slate-800 p-3">Total views: <strong>{metrics.totalViews.toLocaleString()}</strong></div>
        <div className="rounded-xl bg-slate-800 p-3">ROI score: <strong>{Math.round(metrics.totalViews / Math.max(metrics.posted, 1))}</strong></div>
        <div className="rounded-xl bg-slate-800 p-3">Avg retention: <strong>{metrics.avgRetention}%</strong></div>
      </div>

      <DistributionMatrix distribution={distribution} />

      <div className="grid gap-4 md:grid-cols-2">
        <LongVideoTracker videos={videos} />
        <ShortsTables shorts={shorts} />
      </div>

      <TimelineCards timeline={timeline} />
      <RetentionTable retention={retention} />
      <EngagementTable engagement={engagement} />

      <div className="space-y-2">
        {clips.map((clip) => (
          <div key={clip.id} className="flex items-center justify-between rounded-lg bg-slate-800/80 p-3 text-sm">
            <div>
              <p className="font-semibold">{clip.title}</p>
              <p className="text-slate-400">{clip.platform} · {clip.views.toLocaleString()} views</p>
            </div>
            <button
              disabled={clip.posted}
              className="rounded bg-cyan-500/80 px-2 py-1 text-xs font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
              onClick={() => markClipPosted(clip.id)}
            >
              {clip.posted ? 'Posted' : 'Mark Posted'}
            </button>
          </div>
        ))}
      </div>

      <button className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800" onClick={resetSeedData}>
        Reset Base44 Seed Data
      </button>
    </section>
  );
}
