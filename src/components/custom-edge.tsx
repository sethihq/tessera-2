
'use client';
import { getBezierPath, BaseEdge } from 'reactflow';

export function CustomEdge(props: any) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } = props;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge {...props} path={edgePath} style={{
        stroke: 'url(#animated-gradient-url)',
        strokeWidth: 3,
    }} />
  );
}
