-- Amalgam / PulseStream starter relational schema
-- Seed CSVs are designed for import in the order specified in import_order.csv.

CREATE TABLE organizations (
  organization_id TEXT PRIMARY KEY,
  organization_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  internal_codename TEXT,
  positioning TEXT,
  license TEXT,
  repo_name TEXT,
  owner_name TEXT,
  created_at DATE,
  status TEXT
);

CREATE TABLE creators (
  creator_id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(organization_id),
  creator_handle TEXT NOT NULL,
  display_name TEXT,
  creator_type TEXT,
  primary_vertical TEXT,
  creator_stage TEXT,
  onboarding_status TEXT,
  workspace_mode TEXT,
  trust_tier TEXT,
  monetization_probation_start DATE,
  monetization_probation_end DATE,
  payout_enabled BOOLEAN,
  primary_goal TEXT
);

CREATE TABLE platform_accounts (
  platform_account_id TEXT PRIMARY KEY,
  creator_id TEXT REFERENCES creators(creator_id),
  platform TEXT NOT NULL,
  platform_handle TEXT,
  connected TEXT,
  follower_count INTEGER,
  avg_concurrent_viewers_30d INTEGER,
  subscriber_count INTEGER,
  sync_status TEXT,
  last_synced_at TIMESTAMP
);

CREATE TABLE streams (
  stream_id TEXT PRIMARY KEY,
  creator_id TEXT REFERENCES creators(creator_id),
  title TEXT NOT NULL,
  category TEXT,
  lifecycle_stage TEXT,
  started_at TIMESTAMP,
  duration_minutes INTEGER,
  target_platforms TEXT,
  workspace_mode TEXT,
  safe_mode_enabled BOOLEAN,
  shadow_mode_enabled BOOLEAN,
  health_score NUMERIC,
  tier_label TEXT,
  primary_growth_driver TEXT,
  primary_risk TEXT
);

CREATE TABLE signal_definitions (
  signal_id TEXT PRIMARY KEY,
  signal_label TEXT NOT NULL,
  max_value NUMERIC,
  benchmark_direction TEXT,
  critical_threshold_pct NUMERIC,
  traction_threshold_pct NUMERIC,
  on_fire_threshold_pct NUMERIC,
  algorithm_lock_threshold_pct NUMERIC,
  action_1 TEXT,
  action_2 TEXT,
  action_3 TEXT
);

CREATE TABLE stream_signal_metrics (
  metric_id TEXT PRIMARY KEY,
  stream_id TEXT REFERENCES streams(stream_id),
  signal_id TEXT REFERENCES signal_definitions(signal_id),
  raw_value NUMERIC,
  normalized_score NUMERIC,
  trend_7d TEXT,
  weakest_flag BOOLEAN,
  strongest_flag BOOLEAN,
  recommended_action TEXT,
  captured_at TIMESTAMP
);

CREATE TABLE bestie_actions (
  bestie_action_id TEXT PRIMARY KEY,
  stream_id TEXT REFERENCES streams(stream_id),
  creator_id TEXT REFERENCES creators(creator_id),
  action_type TEXT,
  tone TEXT,
  trigger_source TEXT,
  suggestion TEXT,
  priority TEXT,
  creator_accepted BOOLEAN,
  impact_metric TEXT,
  estimated_minutes_saved INTEGER,
  status TEXT
);

CREATE TABLE clip_pipeline (
  clip_id TEXT PRIMARY KEY,
  stream_id TEXT REFERENCES streams(stream_id),
  creator_id TEXT REFERENCES creators(creator_id),
  source_timestamp TEXT,
  clip_hook TEXT,
  destination_platform TEXT,
  status TEXT,
  duration_seconds INTEGER,
  clip_score NUMERIC,
  projected_views INTEGER,
  actual_views INTEGER,
  repurpose_priority TEXT
);

CREATE TABLE raid_crm (
  relationship_id TEXT PRIMARY KEY,
  creator_id TEXT REFERENCES creators(creator_id),
  partner_handle TEXT,
  platform TEXT,
  compatibility_score NUMERIC,
  last_raid_date DATE,
  raids_sent INTEGER,
  raids_received INTEGER,
  follow_up_date DATE,
  relationship_status TEXT,
  next_action TEXT
);

CREATE TABLE monetization_events (
  monetization_event_id TEXT PRIMARY KEY,
  creator_id TEXT REFERENCES creators(creator_id),
  stream_id TEXT REFERENCES streams(stream_id),
  source_type TEXT,
  gross_amount_usd NUMERIC,
  platform_fee_pct NUMERIC,
  trust_flag TEXT,
  escrow_required BOOLEAN,
  payout_status TEXT,
  risk_score NUMERIC,
  notes TEXT
);

CREATE TABLE failover_events (
  failover_event_id TEXT PRIMARY KEY,
  stream_id TEXT REFERENCES streams(stream_id),
  module TEXT,
  failure_type TEXT,
  detected_by TEXT,
  recovery_action TEXT,
  downtime_ms INTEGER,
  viewer_retention_delta_pct NUMERIC,
  resolved BOOLEAN,
  severity TEXT
);

CREATE TABLE growth_forecasts (
  forecast_id TEXT PRIMARY KEY,
  creator_id TEXT REFERENCES creators(creator_id),
  horizon_days INTEGER,
  model_type TEXT,
  projected_avg_viewers INTEGER,
  projected_new_followers INTEGER,
  projected_engagement_rate_pct NUMERIC,
  estimated_revenue_usd NUMERIC,
  confidence_score NUMERIC,
  primary_driver TEXT,
  recommended_action_id TEXT REFERENCES bestie_actions(bestie_action_id)
);
