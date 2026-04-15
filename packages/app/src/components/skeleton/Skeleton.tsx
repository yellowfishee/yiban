import { View } from '@tarojs/components';
import './Skeleton.scss';

interface SkeletonProps {
  width?: string;
  height?: string;
  circle?: boolean;
  className?: string;
}

export default function Skeleton({ 
  width = '100%', 
  height = '20px', 
  circle = false,
  className = ''
}: SkeletonProps) {
  return (
    <View 
      className={`skeleton ${circle ? 'skeleton--circle' : ''} ${className}`}
      style={{ width, height }}
    />
  );
}
