export interface FeedItem {
  id: string;
  type: 'prediction' | 'market' | 'news' | 'alert' | 'moonshot' | 'note' | 'link' | 'article' | 'insight';
  title: string;
  content: string;
  source?: string;
  timestamp: Date;
  link?: string;
  isNew?: boolean;
  isManual?: boolean;
}
