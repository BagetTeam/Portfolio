import type { Landmark } from "../types";

export function skierMotion(progress: number, maxTraversal = 300): number {
  const p = -2.6 * progress + 10;
  console.log(progress);
  const mainCurve =
    Math.sin(2.6 * p * Math.PI + (5 * Math.PI) / 6) * maxTraversal * 0.6;
  const secondaryCurve =
    Math.sin(p * Math.PI - Math.PI / 3) * maxTraversal * 0.3;
  const tertiaryWave = Math.sin(4 * p * Math.PI) * maxTraversal * 0.1;

  return mainCurve + secondaryCurve + tertiaryWave;
}

export function skierSlope(progress: number, maxTraversal = 300): number {
  const p = -2.6 * progress + 10;
  const d = -2.6;

  const dMain =
    Math.cos(2.6 * p * Math.PI + (5 * Math.PI) / 6) *
    maxTraversal *
    0.6 *
    (d * 2.6 * Math.PI);
  const dSecondary =
    Math.cos(p * Math.PI - Math.PI / 3) * maxTraversal * 0.3 * (d * Math.PI);
  const dTertiary =
    Math.cos(4 * p * Math.PI) * maxTraversal * 0.1 * (d * 4 * Math.PI);

  return dMain + dSecondary + dTertiary;
}

export function findCriticalPoints(): number[] {
  const criticalPoints: number[] = [];
  const samples = 1000;

  // Sample the slope function and find sign changes
  for (let i = 0; i < samples - 1; i++) {
    const progress1 = i / samples;
    const progress2 = (i + 1) / samples;
    const slope1 = skierSlope(progress1);
    const slope2 = skierSlope(progress2);

    // Sign change indicates a critical point
    if (slope1 * slope2 < 0) {
      let left = progress1;
      let right = progress2;

      // binary search a close approximation of the critical point
      for (let j = 0; j < 20; j++) {
        const mid = (left + right) / 2;
        const slopeMid = skierSlope(mid);

        if (Math.abs(slopeMid) < 0.0001) {
          criticalPoints.push(mid);
          break;
        }

        if (skierSlope(left) * slopeMid < 0) {
          right = mid;
        } else {
          left = mid;
        }
      }
    }
  }

  return criticalPoints;
}

export function mapScrollToSkierProgress(
  rawProgress: number,
  landmarks: Landmark[]
): number {
  const slowdownRange = 0.06; // Smaller range
  const slowdownFactor = 1.15; // Minimal slowdown (was much higher before)

  let adjustedProgress = 0;
  let lastEnd = 0;

  const segments: Array<{
    start: number;
    end: number;
    cost: number;
    landmark?: Landmark;
  }> = [];

  landmarks.forEach((landmark) => {
    const slowdownStart = Math.max(
      0,
      landmark.progress ? landmark.progress - slowdownRange : 0
    );
    const slowdownEnd = Math.min(
      1,
      landmark.progress ? landmark.progress + slowdownRange : 1
    );

    // Normal segment before slowdown
    if (lastEnd < slowdownStart) {
      segments.push({
        start: lastEnd,
        end: slowdownStart,
        cost: slowdownStart - lastEnd,
      });
    }

    // Minimal slowdown segment (same across all landmarks)
    segments.push({
      start: slowdownStart,
      end: slowdownEnd,
      cost: (slowdownEnd - slowdownStart) * slowdownFactor,
      landmark,
    });

    lastEnd = slowdownEnd;
  });

  if (lastEnd < 1) {
    segments.push({
      start: lastEnd,
      end: 1,
      cost: 1 - lastEnd,
    });
  }

  const actualTotalCost = segments.reduce((sum, seg) => sum + seg.cost, 0);
  const targetCost = rawProgress * actualTotalCost;
  let accumulatedCost = 0;

  for (const segment of segments) {
    if (accumulatedCost + segment.cost >= targetCost) {
      const costInSegment = targetCost - accumulatedCost;
      const progressInSegment = costInSegment / segment.cost;
      adjustedProgress =
        segment.start + progressInSegment * (segment.end - segment.start);
      return Math.max(0, Math.min(1, adjustedProgress));
    }
    accumulatedCost += segment.cost;
  }

  return 1;
}
