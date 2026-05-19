"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuroraText } from "@/components/utils/aurora-text";
import { dashboardConfig } from "@/config/dashboard";
import type {
  DashboardData,
  GitHubContributor,
  GitHubIssueItem,
  GitHubLabel,
  GitHubPullRequestItem,
} from "@/types/github";
import { formatDistanceToNow } from "date-fns";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Flame,
  FolderGit2,
  FolderKanban,
  GitFork,
  GitPullRequest,
  ListChecks,
  MessageSquare,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const compactNumberFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const integerNumberFormatter = new Intl.NumberFormat("en");
const FEED_PREVIEW_LIMIT = 4;
const LEADERBOARD_LIMIT = 5;
const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

type ActivityItem = GitHubIssueItem | GitHubPullRequestItem;

interface MetricCardItem {
  title: string;
  value: number | null;
  description: string;
  href: string;
  icon: LucideIcon;
}

function formatRelativeTime(value: string) {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

function isExternalLink(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function getTopLabels(items: ActivityItem[]): Array<GitHubLabel & { count: number }> {
  const labels = new Map<string, GitHubLabel & { count: number }>();

  items.forEach((item) => {
    item.labels.forEach((label) => {
      const key = label.name.toLowerCase();
      const existing = labels.get(key);

      if (existing) {
        existing.count += 1;
        return;
      }

      labels.set(key, {
        ...label,
        count: 1,
      });
    });
  });

  return [...labels.values()]
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);
}

function getOrdinalLabel(rank: number) {
  if (rank % 10 === 1 && rank % 100 !== 11) {
    return `${rank}st`;
  }

  if (rank % 10 === 2 && rank % 100 !== 12) {
    return `${rank}nd`;
  }

  if (rank % 10 === 3 && rank % 100 !== 13) {
    return `${rank}rd`;
  }

  return `${rank}th`;
}

function AnimatedCounter({
  value,
  className,
  formatter = compactNumberFormatter.format,
}: {
  value: number | null;
  className?: string;
  formatter?: (value: number) => string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.55 });
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === null || shouldReduceMotion || !isInView) {
      return;
    }

    let animationFrame = 0;
    const startTime = performance.now();
    const duration = 950;

    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;

      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, shouldReduceMotion, value]);

  return (
    <span ref={ref} className={className}>
      {value === null
        ? "N/A"
        : shouldReduceMotion
          ? formatter(value)
          : formatter(displayValue)}
    </span>
  );
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, delay, ease: REVEAL_EASE }}
    >
      {children}
    </motion.div>
  );
}

function DashboardBackdrop() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-6 h-80 w-[min(72rem,92vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.18),transparent_60%)]"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                scale: [1, 1.06, 0.98, 1],
                y: [0, 16, -10, 0],
              }
        }
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -left-10 top-48 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.22),transparent_65%)] blur-3xl"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, 28, -12, 0],
                y: [0, -22, 10, 0],
              }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-0 top-96 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.16),transparent_65%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.18),transparent_65%)]"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, -24, 12, 0],
                y: [0, 18, -12, 0],
              }
        }
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-x-0 top-12 h-px bg-linear-to-r from-transparent via-primary/35 to-transparent" />
    </div>
  );
}

function AnimatedFlame({ className, delay = 0 }: { className?: string; delay?: number }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.span
      className={className}
      animate={
        shouldReduceMotion
          ? undefined
          : {
              y: [0, -4, 0],
              scale: [1, 1.12, 1],
              rotate: [-4, 4, -4],
            }
      }
      transition={{ duration: 1.6, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <Flame className="h-4 w-4 fill-orange-400 text-orange-500" />
    </motion.span>
  );
}

function ActivityLane({
  children,
  ariaLabel,
  hintText,
}: {
  children: ReactNode;
  ariaLabel: string;
  hintText: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between pr-1 md:hidden">
        <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px]">
          {hintText}
        </Badge>
        <motion.span
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground"
          animate={shouldReduceMotion ? undefined : { x: [0, 6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          Swipe
          <ArrowRight className="h-3.5 w-3.5" />
        </motion.span>
      </div>

      <div
        aria-label={ariaLabel}
        className="overflow-x-auto overscroll-x-contain pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex snap-x snap-mandatory gap-4 pr-4 sm:pr-6">{children}</div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, description, href, icon: Icon }: MetricCardItem) {
  const external = isExternalLink(href);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className="group block h-full"
      >
        <Card className="relative h-full border border-sky-200/65 bg-white/85 shadow-[0_20px_52px_-46px_rgba(59,130,246,0.3)] backdrop-blur-xl transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/5 dark:border-border/70 dark:bg-card/80 dark:shadow-none">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.14),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:opacity-0" />
          <CardHeader className="relative gap-2 px-3 sm:gap-3">
            <div className="hidden items-center justify-between gap-3 sm:flex">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground sm:text-sm">{title}</p>
              <AnimatedCounter
                value={value}
                className="mt-1 block text-2xl font-semibold tracking-tight sm:mt-2 sm:text-3xl"
              />
            </div>
          </CardHeader>
          <CardContent className="relative hidden sm:block">
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function HeroStat({
  label,
  value,
  description,
}: {
  label: string;
  value: number | null;
  description: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-sky-200/55 bg-white/80 p-3 shadow-[0_18px_44px_-42px_rgba(14,165,233,0.4)] backdrop-blur-md dark:border-border/60 dark:bg-background/55 dark:shadow-none sm:rounded-[1.75rem] sm:p-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]">
        {label}
      </p>
      <AnimatedCounter
        value={value}
        formatter={integerNumberFormatter.format}
        className="mt-2 block text-xl font-semibold tracking-tight sm:mt-3 sm:text-3xl"
      />
      <p className="mt-2 hidden text-sm leading-6 text-muted-foreground sm:block">{description}</p>
    </div>
  );
}

function ContributorsLeaderboard({
  contributors,
  href,
}: {
  contributors: GitHubContributor[];
  href: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Card className="border border-emerald-200/70 bg-linear-to-br from-white via-emerald-50/75 to-cyan-50/80 shadow-[0_30px_80px_-48px_rgba(16,185,129,0.3)] backdrop-blur-xl dark:border-border/70 dark:from-primary/10 dark:via-card dark:to-card dark:shadow-none">
      <CardHeader className="gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-5 w-5 text-primary" />
              Contributors leaderboard
            </CardTitle>
            <CardDescription className="mt-2 text-sm leading-6">
              Top {LEADERBOARD_LIMIT} contributors ranked by public GitHub contributions.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
            Top 5
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {contributors.length > 0 ? (
          contributors.slice(0, LEADERBOARD_LIMIT).map((contributor, index) => {
            const rank = index + 1;
            const isLeader = index === 0;

            return (
              <motion.div
                key={contributor.id}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <Link
                  href={contributor.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className={`group flex items-center gap-3 rounded-3xl border px-3 py-3 transition-all duration-300 hover:border-primary/35 hover:bg-primary/5 sm:px-4 ${
                    isLeader
                      ? "border-primary/35 bg-background/65 shadow-lg shadow-primary/8"
                      : "border-border/60 bg-background/55"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Image
                      src={contributor.avatar_url}
                      alt={contributor.login}
                      width={isLeader ? 56 : 48}
                      height={isLeader ? 56 : 48}
                      unoptimized
                      className={`rounded-full border-2 border-dashed border-border object-cover ${
                        isLeader ? "h-14 w-14" : "h-12 w-12"
                      }`}
                    />
                    <span className="absolute -left-2 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                      #{rank}
                    </span>
                    {rank <= 3 && (
                      <AnimatedFlame className="absolute -right-2 -top-2" delay={index * 0.12} />
                    )}
                    {isLeader && (
                      <AnimatedFlame className="absolute -left-2 bottom-0" delay={0.3} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                      {contributor.login}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isLeader ? "Top performer" : `${getOrdinalLabel(rank)} ranked contributor`}
                    </p>
                  </div>

                  <div className="text-right">
                    <AnimatedCounter
                      value={contributor.contributions}
                      formatter={integerNumberFormatter.format}
                      className="block text-lg font-semibold tracking-tight text-foreground sm:text-xl"
                    />
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      commits
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-white/60 p-4 text-sm leading-6 text-muted-foreground dark:bg-background/35">
            Contributor ranking is temporarily unavailable. Use the contributors page to inspect the latest public leaderboard directly.
          </div>
        )}

        <Link
          href={href}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Open full contributors page
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

function ActivityFeed({
  title,
  description,
  totalCount,
  href,
  items,
  type,
}: {
  title: string;
  description: string;
  totalCount: number | null;
  href: string;
  items: ActivityItem[];
  type: "issue" | "pull-request";
}) {
  const previewItems = items.slice(0, FEED_PREVIEW_LIMIT);
  const shouldReduceMotion = useReducedMotion();

  return (
    <Card className="border border-sky-200/70 bg-white/80 shadow-[0_24px_70px_-50px_rgba(59,130,246,0.28)] backdrop-blur-xl dark:border-border/70 dark:bg-card/85 dark:shadow-none">
      <CardHeader className="gap-4 border-b border-border/60 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              {type === "issue" ? (
                <FolderGit2 className="h-5 w-5 text-primary" />
              ) : (
                <GitPullRequest className="h-5 w-5 text-primary" />
              )}
              {title}
            </CardTitle>
            <CardDescription className="mt-2 max-w-3xl text-sm leading-6">
              {description}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
              {totalCount === null ? "Live data pending" : `${totalCount} open`}
            </Badge>
            {previewItems.length > 0 && (
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                Showing {previewItems.length} latest
              </Badge>
            )}
            <Link
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/50 hover:text-foreground"
            >
              View board
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {previewItems.length > 0 ? (
          <ActivityLane
            ariaLabel={`${title} preview`}
            hintText={type === "issue" ? "Swipe through issue cards" : "Swipe through pull request cards"}
          >
            {previewItems.map((item) => (
              <motion.div
                key={item.id}
                className="w-72 shrink-0 snap-start sm:w-84 lg:w-92"
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <Link
                  href={item.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative flex min-h-72 h-full flex-col justify-between rounded-[1.75rem] border border-sky-200/55 bg-white/82 p-4 shadow-[0_20px_52px_-44px_rgba(56,189,248,0.26)] transition-colors duration-300 hover:border-primary/35 hover:bg-primary/5 dark:border-border/60 dark:bg-background/55 dark:shadow-none"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_58%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px]">
                          #{item.number}
                        </Badge>
                        <span className="inline-flex items-center gap-1">
                          {type === "issue" ? (
                            <FolderKanban className="h-3.5 w-3.5" />
                          ) : (
                            <GitPullRequest className="h-3.5 w-3.5" />
                          )}
                          {type === "issue" ? "Issue" : "Pull request"}
                        </span>
                        {type === "pull-request" && "draft" in item && item.draft && (
                          <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[11px]">
                            Draft
                          </Badge>
                        )}
                      </div>
                      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold leading-6 text-foreground sm:text-base">
                      {item.title}
                    </h3>

                    {item.labels.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.labels.slice(0, 3).map((label) => (
                          <span
                            key={label.id}
                            className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium"
                            style={{
                              borderColor: `#${label.color}33`,
                              backgroundColor: `#${label.color}15`,
                              color: `#${label.color}`,
                            }}
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {item.user.login}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {item.comments} comments
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" />
                      Updated {formatRelativeTime(item.updated_at)}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </ActivityLane>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 p-5 text-sm leading-6 text-muted-foreground">
            Live GitHub activity is temporarily unavailable. Use the board link above to inspect the latest issue and PR state directly on GitHub.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContributionWorkflow() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Card className="border border-sky-200/70 bg-white/80 shadow-[0_24px_70px_-50px_rgba(14,165,233,0.28)] backdrop-blur-xl dark:border-border/70 dark:bg-card/85 dark:shadow-none">
      <CardHeader className="gap-4 border-b border-border/60 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ListChecks className="h-5 w-5 text-primary" />
              Contribution workflow
            </CardTitle>
            <CardDescription className="mt-2 max-w-3xl text-sm leading-6">
              Follow the sequence from issue discovery to review-ready pull request. The arrows make the order explicit for first-time contributors.
            </CardDescription>
          </div>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
            {dashboardConfig.contributionSteps.length} steps
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
          {dashboardConfig.contributionSteps.map((step, index) => (
            <Fragment key={step.title}>
              <motion.div
                className="flex-1"
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <div className="h-full rounded-[1.75rem] border border-sky-200/55 bg-white/82 p-5 shadow-[0_18px_40px_-38px_rgba(59,130,246,0.25)] dark:border-border/60 dark:bg-background/55 dark:shadow-none">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={step.href}
                    target={step.external ? "_blank" : undefined}
                    rel={step.external ? "noreferrer" : undefined}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    {step.cta}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>

              {index < dashboardConfig.contributionSteps.length - 1 && (
                <div className="flex items-center justify-center text-primary/60">
                  <ArrowDown className="h-5 w-5 lg:hidden" />
                  <ArrowRight className="hidden h-5 w-5 lg:block" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const metricCards: MetricCardItem[] = [
    {
      title: "Open issues",
      value: data.issues.totalCount,
      description: "Tasks available for triage, fixes, feature work, and documentation updates.",
      href: data.links.issues,
      icon: FolderKanban,
    },
    {
      title: "Open pull requests",
      value: data.pullRequests.totalCount,
      description: "Changes currently moving through review, feedback, and merge readiness.",
      href: data.links.pulls,
      icon: GitPullRequest,
    },
    {
      title: "Contributors",
      value: data.contributorCount,
      description: "Developers already active in the repository and visible on the leaderboard.",
      href: data.links.contributors,
      icon: Users,
    },
    {
      title: "Projects",
      value: data.totalProjects,
      description: "Curated React and Next.js project entries available to explore and extend.",
      href: data.links.projects,
      icon: FolderGit2,
    },
    {
      title: "Stars",
      value: data.repo?.stargazers_count ?? null,
      description: "Community attention around the repository and the project catalog.",
      href: data.links.stargazers,
      icon: Star,
    },
    {
      title: "Forks",
      value: data.repo?.forks_count ?? null,
      description: "Active repository copies used by contributors to build and submit changes.",
      href: data.links.network,
      icon: GitFork,
    },
  ];

  const activeLabels = getTopLabels([
    ...data.issues.items,
    ...data.pullRequests.items,
  ]);

  return (
    <section className="relative mt-20 overflow-hidden px-4 pb-16 pt-8 md:pt-10">
      <DashboardBackdrop />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:gap-8">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="border border-sky-200/70 bg-linear-to-br from-white via-sky-50/80 to-emerald-50/75 shadow-[0_32px_90px_-54px_rgba(59,130,246,0.32)] backdrop-blur-xl dark:border-border/70 dark:from-card/85 dark:via-card/85 dark:to-card/85 dark:shadow-none">
              <CardHeader className="gap-5 pb-2 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Badge variant="outline" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.16em]">
                    Live contribution hub
                  </Badge>
                </div>

                <div className="space-y-4">
                  <CardTitle className="text-4xl font-bold leading-tight md:text-6xl">
                    Contributor{" "}
                    <AuroraText colors={["#22d3ee", "#3b82f6", "#6366f1", "#a855f7", "#ec4899"]}>
                      Dashboard
                    </AuroraText>
                  </CardTitle>
                  <CardDescription className="mx-auto max-w-3xl text-sm leading-7 text-foreground/60 md:text-xl lg:mx-0">
                    {dashboardConfig.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-6 pt-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <HeroStat
                    label="Issue queue"
                    value={data.issues.totalCount}
                    description="Open tasks ready for contribution and triage."
                  />
                  <HeroStat
                    label="Review lane"
                    value={data.pullRequests.totalCount}
                    description="Pull requests currently moving through review."
                  />
                  <HeroStat
                    label="Project surface"
                    value={data.totalProjects}
                    description="Catalog entries contributors can explore or improve."
                  />
                </div>

                <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                  <Link
                    href={data.links.issues}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto"
                  >
                    Browse open issues
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href={data.links.pulls}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/45 hover:bg-primary/5 sm:w-auto"
                  >
                    Review pull requests
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href={data.links.guide}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/45 hover:bg-primary/5 sm:w-auto"
                  >
                    Read contributing guide
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <ContributorsLeaderboard
              contributors={data.topContributors}
              href={data.links.contributors}
            />
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {metricCards.map((card) => (
              <MetricCard key={card.title} {...card} />
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ActivityFeed
            title="Issue activity"
            description="Open issue context for contributors who want to pick scoped work fast. The lane shows only the latest cards and clearly hints that more activity is available by swiping on mobile."
            totalCount={data.issues.totalCount}
            href={data.links.issues}
            items={data.issues.items}
            type="issue"
          />
        </Reveal>

        <Reveal delay={0.15}>
          <ActivityFeed
            title="Pull request activity"
            description="Current review queue and implementation work already moving through the repository, previewed in compact swipeable cards without overcommitting space on small screens."
            totalCount={data.pullRequests.totalCount}
            href={data.links.pulls}
            items={data.pullRequests.items}
            type="pull-request"
          />
        </Reveal>

        <Reveal delay={0.2}>
          <ContributionWorkflow />
        </Reveal>

        <Reveal delay={0.25}>
          <Card className="border border-sky-200/70 bg-white/80 shadow-[0_24px_70px_-50px_rgba(14,165,233,0.28)] backdrop-blur-xl dark:border-border/70 dark:bg-card/85 dark:shadow-none">
            <CardHeader className="gap-3 border-b border-border/60 pb-5">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-primary" />
                Active label signals
              </CardTitle>
              <CardDescription className="text-sm leading-6">
                The most visible labels across the currently previewed issue and PR queue.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {activeLabels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeLabels.map((label) => (
                    <span
                      key={label.id}
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
                      style={{
                        borderColor: `#${label.color}33`,
                        backgroundColor: `#${label.color}15`,
                        color: `#${label.color}`,
                      }}
                    >
                      {label.name}
                      <span className="text-[10px] opacity-80">x{label.count}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  Label insights will appear here as soon as GitHub activity data is available.
                </p>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}